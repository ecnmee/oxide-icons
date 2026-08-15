// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

describe('public entry point (oxide-icons)', () => {
  it('registers <ox-icon> as a side effect of import', async () => {
    expect(customElements.get('ox-icon')).toBeUndefined();
    await import('../src/index');
    expect(customElements.get('ox-icon')).toBeDefined();
  });

  it('does not throw when imported a second time', async () => {
    await import('../src/index');
    await import('../src/index');
    expect(customElements.get('ox-icon')).toBeDefined();
  });

  it('re-exports the building blocks examples/basic/main.ts assembles by hand', async () => {
    const mod = await import('../src/index');

    expect(mod.OxIconElement).toBeTypeOf('function');
    expect(mod.Registry).toBeTypeOf('function');
    expect(mod.MemoryIconCatalog).toBeTypeOf('function');
    expect(mod.IsolationPolicy).toBeTypeOf('function');
    expect(mod.SvgIconRenderer).toBeTypeOf('function');
    expect(mod.toIconId).toBeTypeOf('function');
  });
});

describe('vite subpath entry point (oxide-icons/vite)', () => {
  it('re-exports createIconSource', async () => {
    const mod = await import('../src/vite-plugin/index');

    expect(mod.createIconSource).toBeTypeOf('function');
  });
});
