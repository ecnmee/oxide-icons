import { describe, expect, it, vi } from 'vitest';
import { Registry } from '../../../src/core/registry/Registry';
import { MemoryIconCatalog } from '../../../src/core/catalog/MemoryIconCatalog';
import { toIconId, type IconData, type IconLoader, type Manifest } from '../../../src/core/domain';

function icon(family: string, name: string): IconData {
  return {
    id: toIconId(family, name),
    family,
    name,
    viewBox: '0 0 24 24',
    body: `<path d="${family}-${name}" />`,
  };
}

/** A loader whose resolution is controlled manually by the test. */
function deferredLoader() {
  let resolveLoad!: (icons: IconData[]) => void;
  const callCount = { value: 0 };

  const loader: IconLoader = {
    load: vi.fn(async (_family: string) => {
      callCount.value += 1;
      return new Promise<IconData[]>((resolve) => {
        resolveLoad = resolve;
      });
    }),
  };

  return { loader, resolve: (icons: IconData[]) => resolveLoad(icons), callCount };
}

describe('Registry', () => {
  it('throws when the id is not in the manifest', async () => {
    const manifest: Manifest = new Map();
    const registry = new Registry(manifest, new MemoryIconCatalog());

    await expect(registry.ensureLoaded(toIconId('ui', 'add'))).rejects.toThrow(/not found/);
  });

  it('resolves without loading anything if the icon is already in the catalog', async () => {
    const uiAdd = icon('ui', 'add');
    const manifest: Manifest = new Map([[uiAdd.id, 'ui']]);
    const catalog = new MemoryIconCatalog();
    catalog.add([uiAdd]);
    catalog.markFamilyLoaded('ui');

    const loader: IconLoader = { load: vi.fn() };
    const registry = new Registry(manifest, catalog);
    registry.registerLoader('ui', loader);

    await registry.ensureLoaded(uiAdd.id);

    expect(loader.load).not.toHaveBeenCalled();
  });

  it('loads the family via the registered loader and adds the result to the catalog', async () => {
    const uiAdd = icon('ui', 'add');
    const uiEdit = icon('ui', 'edit');
    const manifest: Manifest = new Map([
      [uiAdd.id, 'ui'],
      [uiEdit.id, 'ui'],
    ]);
    const catalog = new MemoryIconCatalog();
    const loader: IconLoader = { load: vi.fn(async () => [uiAdd, uiEdit]) };

    const registry = new Registry(manifest, catalog);
    registry.registerLoader('ui', loader);

    await registry.ensureLoaded(uiAdd.id);

    expect(registry.get(uiAdd.id)).toEqual(uiAdd);
    expect(registry.get(uiEdit.id)).toEqual(uiEdit);
    expect(registry.has(uiEdit.id)).toBe(true);
  });

  it('throws when no loader is registered for the icon family', async () => {
    const uiAdd = icon('ui', 'add');
    const manifest: Manifest = new Map([[uiAdd.id, 'ui']]);
    const registry = new Registry(manifest, new MemoryIconCatalog());

    await expect(registry.ensureLoaded(uiAdd.id)).rejects.toThrow(/no loader registered/);
  });

  it('throws when the loader loads the family but does not provide the requested icon', async () => {
    const uiAdd = icon('ui', 'add');
    const manifest: Manifest = new Map([[uiAdd.id, 'ui']]);
    const catalog = new MemoryIconCatalog();
    // Loader "succeeds" but returns an unrelated icon, not uiAdd.
    const loader: IconLoader = { load: vi.fn(async () => [icon('ui', 'edit')]) };

    const registry = new Registry(manifest, catalog);
    registry.registerLoader('ui', loader);

    await expect(registry.ensureLoaded(uiAdd.id)).rejects.toThrow(/did not provide it/);
  });

  it('does not call the loader again for a family already marked loaded, even for a different icon in it', async () => {
    const uiAdd = icon('ui', 'add');
    const uiEdit = icon('ui', 'edit');
    const manifest: Manifest = new Map([
      [uiAdd.id, 'ui'],
      [uiEdit.id, 'ui'],
    ]);
    const catalog = new MemoryIconCatalog();
    const loader: IconLoader = { load: vi.fn(async () => [uiAdd, uiEdit]) };

    const registry = new Registry(manifest, catalog);
    registry.registerLoader('ui', loader);

    await registry.ensureLoaded(uiAdd.id);
    await registry.ensureLoaded(uiEdit.id);

    expect(loader.load).toHaveBeenCalledTimes(1);
  });

  it('concurrency: two ensureLoaded calls for the same not-yet-loaded family share one load, the loader is called exactly once', async () => {
    const uiAdd = icon('ui', 'add');
    const uiEdit = icon('ui', 'edit');
    const manifest: Manifest = new Map([
      [uiAdd.id, 'ui'],
      [uiEdit.id, 'ui'],
    ]);
    const catalog = new MemoryIconCatalog();
    const { loader, resolve, callCount } = deferredLoader();

    const registry = new Registry(manifest, catalog);
    registry.registerLoader('ui', loader);

    const first = registry.ensureLoaded(uiAdd.id);
    const second = registry.ensureLoaded(uiEdit.id);

    expect(callCount.value).toBe(1);

    resolve([uiAdd, uiEdit]);
    await Promise.all([first, second]);

    expect(loader.load).toHaveBeenCalledTimes(1);
    expect(registry.has(uiAdd.id)).toBe(true);
    expect(registry.has(uiEdit.id)).toBe(true);
  });

  it('a later call can retry a family whose earlier load failed', async () => {
    const uiAdd = icon('ui', 'add');
    const manifest: Manifest = new Map([[uiAdd.id, 'ui']]);
    const catalog = new MemoryIconCatalog();

    let attempt = 0;
    const loader: IconLoader = {
      load: vi.fn(async () => {
        attempt += 1;
        if (attempt === 1) {
          throw new Error('network error');
        }
        return [uiAdd];
      }),
    };

    const registry = new Registry(manifest, catalog);
    registry.registerLoader('ui', loader);

    await expect(registry.ensureLoaded(uiAdd.id)).rejects.toThrow('network error');
    await registry.ensureLoaded(uiAdd.id);

    expect(registry.has(uiAdd.id)).toBe(true);
    expect(loader.load).toHaveBeenCalledTimes(2);
  });
});
