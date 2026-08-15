import { describe, expect, it } from 'vitest';
import { MemoryIconCatalog } from '../../../src/core/catalog/MemoryIconCatalog';
import { toIconId, type IconData } from '../../../src/core/domain';

function makeIcon(family: string, name: string): IconData {
  return {
    id: toIconId(family, name),
    family,
    name,
    viewBox: '0 0 24 24',
    body: '<path d="M0 0h24v24H0z" />',
  };
}

describe('MemoryIconCatalog', () => {
  it('has() is false for an icon that was never added', () => {
    const catalog = new MemoryIconCatalog();
    expect(catalog.has(toIconId('ui', 'add'))).toBe(false);
  });

  it('get() returns null for an icon that was never added', () => {
    const catalog = new MemoryIconCatalog();
    expect(catalog.get(toIconId('ui', 'add'))).toBeNull();
  });

  it('stores an icon so has() and get() see it', () => {
    const catalog = new MemoryIconCatalog();
    const icon = makeIcon('ui', 'add');

    catalog.add([icon]);

    expect(catalog.has(icon.id)).toBe(true);
    expect(catalog.get(icon.id)).toEqual(icon);
  });

  it('stores multiple icons from a single add() call', () => {
    const catalog = new MemoryIconCatalog();
    const add = makeIcon('ui', 'add');
    const edit = makeIcon('ui', 'edit');

    catalog.add([add, edit]);

    expect(catalog.get(add.id)).toEqual(add);
    expect(catalog.get(edit.id)).toEqual(edit);
  });

  it('throws when add() is called with an id already in the catalog', () => {
    const catalog = new MemoryIconCatalog();
    const original = makeIcon('ui', 'add');
    const duplicate: IconData = { ...original, viewBox: '0 0 32 32' };

    catalog.add([original]);

    expect(() => catalog.add([duplicate])).toThrow(/duplicate icon id/);
  });

  it('throws when a single add() call contains two icons with the same id', () => {
    const catalog = new MemoryIconCatalog();
    const icon = makeIcon('ui', 'add');

    expect(() => catalog.add([icon, { ...icon }])).toThrow(/duplicate icon id/);
  });

  it('add() is atomic: a rejected batch leaves the catalog unchanged, no partial insert', () => {
    const catalog = new MemoryIconCatalog();
    const add = makeIcon('ui', 'add');
    const edit = makeIcon('ui', 'edit');
    const editAgain: IconData = { ...edit };

    expect(() => catalog.add([add, edit, editAgain])).toThrow(/duplicate icon id/);

    expect(catalog.has(add.id)).toBe(false);
    expect(catalog.has(edit.id)).toBe(false);
  });

  it('hasFamily() is false until markFamilyLoaded() is called', () => {
    const catalog = new MemoryIconCatalog();
    expect(catalog.hasFamily('ui')).toBe(false);

    catalog.markFamilyLoaded('ui');

    expect(catalog.hasFamily('ui')).toBe(true);
  });

  it('markFamilyLoaded() is idempotent', () => {
    const catalog = new MemoryIconCatalog();

    catalog.markFamilyLoaded('ui');
    catalog.markFamilyLoaded('ui');

    expect(catalog.hasFamily('ui')).toBe(true);
  });

  it('families are tracked independently of icons and of each other', () => {
    const catalog = new MemoryIconCatalog();
    catalog.markFamilyLoaded('ui');

    expect(catalog.hasFamily('ui')).toBe(true);
    expect(catalog.hasFamily('arrows')).toBe(false);
    expect(catalog.has(toIconId('ui', 'add'))).toBe(false);
  });
});
