// @vitest-environment jsdom
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * Real dynamic import() of the actual icon files goes through Vite's
 * module graph, slower and less deterministic than the fake, instantly
 * resolving loaders used in other test files. A single setTimeout(0)
 * tick is not reliably enough time, poll instead.
 */
async function waitFor(predicate: () => boolean, timeoutMs = 2000): Promise<void> {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(`waitFor: condition not met within ${timeoutMs}ms`);
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

describe('examples/basic, the real wiring code, not a reimplementation', () => {
  beforeAll(async () => {
    // Side-effecting import: registers customElements.define('ox-icon', ...)
    // and wires OxIconElement's statics exactly like the real demo page does.
    await import('../../examples/basic/main');
  });

  it('renders a real icon end to end through the actual demo wiring', async () => {
    const el = document.createElement('ox-icon');
    el.setAttribute('name', 'add');
    el.setAttribute('family', 'ui');
    document.body.appendChild(el);
    await waitFor(() => el.shadowRoot?.querySelector('svg') != null);

    expect(el.shadowRoot?.querySelector('svg')).not.toBeNull();

    document.body.removeChild(el);
  });

  it('renders every icon referenced in index.html without an oxide-icon-error', async () => {
    const uiNames = ['add', 'remove', 'close', 'check', 'search', 'edit', 'trash', 'menu', 'chevron-down', 'chevron-right'];
    const arrowNames = ['left', 'right', 'up', 'down'];

    const errors: unknown[] = [];
    const onError = (e: Event) => errors.push((e as CustomEvent).detail);
    document.addEventListener('oxide-icon-error', onError);

    const container = document.createElement('div');
    for (const name of uiNames) {
      const el = document.createElement('ox-icon');
      el.setAttribute('name', name);
      el.setAttribute('family', 'ui');
      container.appendChild(el);
    }
    for (const name of arrowNames) {
      const el = document.createElement('ox-icon');
      el.setAttribute('name', name);
      el.setAttribute('family', 'arrows');
      container.appendChild(el);
    }
    document.body.appendChild(container);
    await waitFor(
      () => container.querySelectorAll('ox-icon').length === uiNames.length + arrowNames.length &&
        [...container.querySelectorAll('ox-icon')].every(
          (el) => (el as HTMLElement).shadowRoot?.querySelector('svg') != null || errors.length > 0
        )
    );

    const rendered = [...container.querySelectorAll('ox-icon')].filter(
      (el) => (el as HTMLElement).shadowRoot?.querySelector('svg') != null
    );

    expect(rendered).toHaveLength(uiNames.length + arrowNames.length);
    expect(errors).toHaveLength(0);

    document.body.removeChild(container);
    document.removeEventListener('oxide-icon-error', onError);
  });

  it('the exclusive isolation demo renders nothing, the strict demo reports an error, matching index.html', async () => {
    const errors: unknown[] = [];
    const onError = (e: Event) => errors.push((e as CustomEvent).detail);
    document.addEventListener('oxide-icon-error', onError);

    const exclusiveWrapper = document.createElement('div');
    exclusiveWrapper.setAttribute('data-icon-family', 'ui');
    exclusiveWrapper.setAttribute('data-icon-isolation', 'exclusive');
    const exclusiveIcon = document.createElement('ox-icon');
    exclusiveIcon.setAttribute('name', 'add');
    exclusiveIcon.setAttribute('family', 'arrows');
    exclusiveWrapper.appendChild(exclusiveIcon);

    const strictWrapper = document.createElement('div');
    strictWrapper.setAttribute('data-icon-family', 'ui');
    strictWrapper.setAttribute('data-icon-isolation', 'strict');
    const strictIcon = document.createElement('ox-icon');
    strictIcon.setAttribute('name', 'add');
    strictIcon.setAttribute('family', 'arrows');
    strictWrapper.appendChild(strictIcon);

    document.body.appendChild(exclusiveWrapper);
    document.body.appendChild(strictWrapper);
    await waitFor(() => errors.length > 0);

    expect(exclusiveIcon.shadowRoot?.childNodes.length).toBe(0);
    expect(strictIcon.shadowRoot?.childNodes.length).toBe(0);
    expect(errors).toHaveLength(1);

    document.body.removeChild(exclusiveWrapper);
    document.body.removeChild(strictWrapper);
    document.removeEventListener('oxide-icon-error', onError);
  });
});
