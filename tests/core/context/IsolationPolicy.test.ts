import { describe, expect, it } from 'vitest';
import { IsolationPolicy } from '../../../src/core/context/IsolationPolicy';
import type { IconContext } from '../../../src/core/domain';

describe('IsolationPolicy', () => {
  it('allows and reports no-context when there is no enclosing context', () => {
    const policy = new IsolationPolicy();

    const result = policy.resolve('ui', null);

    expect(result).toEqual({
      allowed: true,
      reason: 'no-context',
      message: null,
      effectiveFamily: 'ui',
      mode: 'soft',
      inherited: false,
    });
  });

  it('allows and reports match when the icon family equals the context family', () => {
    const policy = new IsolationPolicy();
    const context: IconContext = { family: 'ui', mode: 'strict', inherited: true };

    const result = policy.resolve('ui', context);

    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('match');
    expect(result.message).toBeNull();
    expect(result.effectiveFamily).toBe('ui');
    expect(result.mode).toBe('strict');
    expect(result.inherited).toBe(true);
  });

  it('soft mismatch: allowed, with a message', () => {
    const policy = new IsolationPolicy();
    const context: IconContext = { family: 'finance', mode: 'soft', inherited: false };

    const result = policy.resolve('medical', context);

    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('soft-mismatch');
    expect(result.message).toContain('medical');
    expect(result.message).toContain('finance');
    expect(result.effectiveFamily).toBe('finance');
  });

  it('exclusive mismatch: not allowed, distinct reason from strict', () => {
    const policy = new IsolationPolicy();
    const context: IconContext = { family: 'finance', mode: 'exclusive', inherited: false };

    const result = policy.resolve('medical', context);

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('exclusive-block');
  });

  it('strict mismatch: not allowed, distinct reason from exclusive, never throws', () => {
    const policy = new IsolationPolicy();
    const context: IconContext = { family: 'finance', mode: 'strict', inherited: false };

    const result = policy.resolve('medical', context);

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('strict-block');
  });

  it('propagates inherited from the context unchanged, both true and false', () => {
    const policy = new IsolationPolicy();

    const inherited = policy.resolve('ui', { family: 'ui', mode: 'soft', inherited: true });
    const direct = policy.resolve('ui', { family: 'ui', mode: 'soft', inherited: false });

    expect(inherited.inherited).toBe(true);
    expect(direct.inherited).toBe(false);
  });

  it('never throws for any mode, including strict', () => {
    const policy = new IsolationPolicy();
    const context: IconContext = { family: 'finance', mode: 'strict', inherited: false };

    expect(() => policy.resolve('medical', context)).not.toThrow();
  });
});
