// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OxIconElement } from '../../src/web-component/OxIconElement';
import { Registry } from '../../src/core/registry/Registry';
import { IsolationPolicy } from '../../src/core/context/IsolationPolicy';
import { SvgIconRenderer } from '../../src/core/renderer/SvgIconRenderer';
import { MemoryIconCatalog } from '../../src/core/catalog/MemoryIconCatalog';
import { toIconId, type IconData, type IconLoader, type Manifest } from '../../src/core/domain';

const TAG = 'ox-icon-test';

if (!customElements.get(TAG)) {
  customElements.define(TAG, OxIconElement);
}

function icon(name: string, family = 'ui'): IconData {
  return {
    id: toIconId(family, name),
    family,
    name,
    viewBox: '0 0 24 24',
    body: '<path d="M0 0" />',
  };
}

function setup(entries: Array<[string, string]> = [[toIconId('ui', 'add'), 'ui']]) {
  const manifest: Manifest = new Map(entries as [string, string][]);
  const catalog = new MemoryIconCatalog();
  const registry = new Registry(manifest, catalog);
  const isolationPolicy = new IsolationPolicy();
  const renderer = new SvgIconRenderer();

  OxIconElement.registry = registry;
  OxIconElement.renderer = renderer;
  OxIconElement.isolationPolicy = isolationPolicy;
  OxIconElement.manifest = manifest;

  return { manifest, catalog, registry, isolationPolicy, renderer };
}

function registerLoader(registry: Registry, family: string, icons: IconData[]) {
  const loader: IconLoader = { load: vi.fn(async () => icons) };
  registry.registerLoader(family, loader);
  return loader;
}

async function flushMicrotasks(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/** Attaches an element and captures every 'oxide-icon-error' it dispatches. */
function attachWithErrorCapture(el: HTMLElement, parent: Element = document.body): CustomEvent[] {
  const events: CustomEvent[] = [];
  el.addEventListener('oxide-icon-error', (e) => events.push(e as CustomEvent));
  parent.appendChild(el);
  return events;
}

let errorSpy: ReturnType<typeof vi.spyOn>;
let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  OxIconElement.registry = undefined;
  OxIconElement.renderer = undefined;
  OxIconElement.isolationPolicy = undefined;
  OxIconElement.manifest = undefined;
  document.body.innerHTML = '';
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('OxIconElement, unified error reporting (ADR-0013)', () => {
  it('reports (does not throw) if used before dependencies are configured', async () => {
    const el = document.createElement(TAG);
    el.setAttribute('name', 'add');
    el.setAttribute('family', 'ui');

    const events = attachWithErrorCapture(el);
    await flushMicrotasks();

    expect(events).toHaveLength(1);
    expect((events[0]?.detail as Error).message).toMatch(/must be configured/);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(el.shadowRoot?.childNodes.length).toBe(0);
  });

  it('reports if the name attribute is missing', async () => {
    setup();
    const el = document.createElement(TAG);
    el.setAttribute('family', 'ui');

    const events = attachWithErrorCapture(el);
    await flushMicrotasks();

    expect((events[0]?.detail as Error).message).toMatch(/"name" attribute is required/);
  });

  it('reports if family cannot be determined (no attribute, no context)', async () => {
    setup();
    const el = document.createElement(TAG);
    el.setAttribute('name', 'add');

    const events = attachWithErrorCapture(el);
    await flushMicrotasks();

    expect((events[0]?.detail as Error).message).toMatch(/cannot determine the icon's family/);
  });

  it('reports on an invalid data-icon-isolation value', async () => {
    setup();
    const el = document.createElement(TAG);
    el.setAttribute('name', 'add');
    el.setAttribute('data-icon-family', 'ui');
    el.setAttribute('data-icon-isolation', 'bogus');

    const events = attachWithErrorCapture(el);
    await flushMicrotasks();

    expect((events[0]?.detail as Error).message).toMatch(/invalid data-icon-isolation/);
  });

  it('reports on a strict-block mismatch, with a distinct message', async () => {
    setup();
    const el = document.createElement(TAG);
    el.setAttribute('name', 'hospital');
    el.setAttribute('family', 'medical');
    el.setAttribute('data-icon-family', 'finance');
    el.setAttribute('data-icon-isolation', 'strict');

    const events = attachWithErrorCapture(el);
    await flushMicrotasks();

    expect((events[0]?.detail as Error).message).toMatch(/blocked/);
  });

  it('reports if the resolved icon id is not in the manifest', async () => {
    setup([]);
    const el = document.createElement(TAG);
    el.setAttribute('name', 'unknown');
    el.setAttribute('family', 'ui');

    const events = attachWithErrorCapture(el);
    await flushMicrotasks();

    expect((events[0]?.detail as Error).message).toMatch(/is not in the manifest/);
  });

  it('reports and renders nothing when the loader fails asynchronously', async () => {
    const { registry } = setup();
    const loader: IconLoader = {
      load: vi.fn(async () => {
        throw new Error('network down');
      }),
    };
    registry.registerLoader('ui', loader);

    const el = document.createElement(TAG);
    el.setAttribute('name', 'add');
    el.setAttribute('family', 'ui');
    const events = attachWithErrorCapture(el);
    await flushMicrotasks();

    expect(events).toHaveLength(1);
    expect((events[0]?.detail as Error).message).toBe('network down');
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(el.shadowRoot?.childNodes.length).toBe(0);
  });
});

describe('OxIconElement, exclusive and soft mismatches', () => {
  it('exclusive-block: renders nothing, no console output, no error event', async () => {
    const { registry } = setup();
    registerLoader(registry, 'ui', [icon('add')]);

    const el = document.createElement(TAG);
    el.setAttribute('name', 'add');
    el.setAttribute('family', 'ui');
    el.setAttribute('data-icon-family', 'finance');
    el.setAttribute('data-icon-isolation', 'exclusive');
    const events = attachWithErrorCapture(el);
    await flushMicrotasks();

    expect(el.shadowRoot?.childNodes.length).toBe(0);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(events).toHaveLength(0);
  });

  it('soft-mismatch: warns and still renders the icon', async () => {
    const { registry } = setup();
    registerLoader(registry, 'ui', [icon('add')]);

    const el = document.createElement(TAG);
    el.setAttribute('name', 'add');
    el.setAttribute('family', 'ui');
    el.setAttribute('data-icon-family', 'finance');
    el.setAttribute('data-icon-isolation', 'soft');
    document.body.appendChild(el);
    await flushMicrotasks();

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(el.shadowRoot?.querySelector('svg')).not.toBeNull();
  });
});

describe('OxIconElement, context resolution', () => {
  it('inherited: false when data-icon-family is on the element itself', async () => {
    const { registry } = setup();
    registerLoader(registry, 'ui', [icon('add')]);

    const el = document.createElement(TAG);
    el.setAttribute('name', 'add');
    el.setAttribute('data-icon-family', 'ui');
    document.body.appendChild(el);
    await flushMicrotasks();

    expect(el.shadowRoot?.querySelector('svg')).not.toBeNull();
  });

  it('inherited: true when data-icon-family is on an ancestor', async () => {
    const { registry } = setup();
    registerLoader(registry, 'ui', [icon('add')]);

    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-icon-family', 'ui');
    const el = document.createElement(TAG);
    el.setAttribute('name', 'add');
    wrapper.appendChild(el);
    document.body.appendChild(wrapper);
    await flushMicrotasks();

    expect(el.shadowRoot?.querySelector('svg')).not.toBeNull();
  });

  it('context is null with no data-icon-family anywhere, family attribute alone is enough', async () => {
    const { registry } = setup();
    registerLoader(registry, 'ui', [icon('add')]);

    const el = document.createElement(TAG);
    el.setAttribute('name', 'add');
    el.setAttribute('family', 'ui');
    document.body.appendChild(el);
    await flushMicrotasks();

    expect(el.shadowRoot?.querySelector('svg')).not.toBeNull();
  });
});

describe('OxIconElement, rendering and re-render', () => {
  it('renders a real SVG into an open shadow root', async () => {
    const { registry } = setup();
    registerLoader(registry, 'ui', [icon('add')]);

    const el = document.createElement(TAG);
    el.setAttribute('name', 'add');
    el.setAttribute('family', 'ui');
    document.body.appendChild(el);
    await flushMicrotasks();

    expect(el.shadowRoot?.mode).toBe('open');
    expect(el.shadowRoot?.querySelector('svg')).not.toBeNull();
  });

  it('re-renders when the name attribute changes', async () => {
    const { registry } = setup([
      [toIconId('ui', 'add'), 'ui'],
      [toIconId('ui', 'edit'), 'ui'],
    ]);
    registerLoader(registry, 'ui', [icon('add'), icon('edit')]);

    const el = document.createElement(TAG);
    el.setAttribute('name', 'add');
    el.setAttribute('family', 'ui');
    document.body.appendChild(el);
    await flushMicrotasks();

    el.setAttribute('name', 'edit');
    await flushMicrotasks();

    expect(el.shadowRoot?.querySelector('svg')).not.toBeNull();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('re-renders when color changes, reflected in the stroke attribute', async () => {
    const { registry } = setup();
    registerLoader(registry, 'ui', [icon('add')]);

    const el = document.createElement(TAG);
    el.setAttribute('name', 'add');
    el.setAttribute('family', 'ui');
    document.body.appendChild(el);
    await flushMicrotasks();

    el.setAttribute('color', 'red');
    await flushMicrotasks();

    expect(el.shadowRoot?.querySelector('svg')?.getAttribute('stroke')).toBe('red');
  });

  it('re-renders when a self-declared data-icon-family changes', async () => {
    const { registry } = setup([
      [toIconId('ui', 'add'), 'ui'],
      [toIconId('arrows', 'add'), 'arrows'],
    ]);
    registerLoader(registry, 'ui', [icon('add', 'ui')]);
    registerLoader(registry, 'arrows', [icon('add', 'arrows')]);

    const el = document.createElement(TAG);
    el.setAttribute('name', 'add');
    el.setAttribute('data-icon-family', 'ui');
    document.body.appendChild(el);
    await flushMicrotasks();

    el.setAttribute('data-icon-family', 'arrows');
    await flushMicrotasks();

    expect(errorSpy).not.toHaveBeenCalled();
    expect(el.shadowRoot?.querySelector('svg')).not.toBeNull();
  });
});
