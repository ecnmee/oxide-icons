import { describe, expect, it, vi } from 'vitest';
import { DynamicImportIconLoader, type FamilyModule } from '../../../src/core/loader/DynamicImportIconLoader';
import { toIconId } from '../../../src/core/domain';

function resolverFor(modules: Record<string, FamilyModule>) {
  return vi.fn(async (family: string) => {
    const found = modules[family];
    if (!found) {
      throw new Error(`no module registered for family "${family}"`);
    }
    return { default: found };
  });
}

describe('DynamicImportIconLoader', () => {
  it('builds one IconData per entry in the resolved family module', async () => {
    const resolver = resolverFor({
      ui: {
        add: { viewBox: '0 0 24 24', body: '<path d="M0 0" />' },
        edit: { viewBox: '0 0 24 24', body: '<path d="M1 1" />' },
      },
    });
    const loader = new DynamicImportIconLoader(resolver);

    const icons = await loader.load('ui');

    expect(icons).toHaveLength(2);
    expect(icons).toContainEqual({
      id: toIconId('ui', 'add'),
      family: 'ui',
      name: 'add',
      viewBox: '0 0 24 24',
      body: '<path d="M0 0" />',
    });
    expect(icons).toContainEqual({
      id: toIconId('ui', 'edit'),
      family: 'ui',
      name: 'edit',
      viewBox: '0 0 24 24',
      body: '<path d="M1 1" />',
    });
  });

  it('calls the resolver with the requested family', async () => {
    const resolver = resolverFor({ arrows: {} });
    const loader = new DynamicImportIconLoader(resolver);

    await loader.load('arrows');

    expect(resolver).toHaveBeenCalledWith('arrows');
    expect(resolver).toHaveBeenCalledTimes(1);
  });

  it('returns an empty array for a family module with no entries', async () => {
    const resolver = resolverFor({ empty: {} });
    const loader = new DynamicImportIconLoader(resolver);

    const icons = await loader.load('empty');

    expect(icons).toEqual([]);
  });

  it('passes through optional fields (tags, aliases) unchanged', async () => {
    const resolver = resolverFor({
      ui: {
        add: {
          viewBox: '0 0 24 24',
          body: '<path />',
          tags: ['plus', 'create'],
          aliases: ['plus'],
        },
      },
    });
    const loader = new DynamicImportIconLoader(resolver);

    const [icon] = await loader.load('ui');

    expect(icon.tags).toEqual(['plus', 'create']);
    expect(icon.aliases).toEqual(['plus']);
  });

  it('propagates a rejection from the resolver instead of swallowing it', async () => {
    const resolver = vi.fn(async () => {
      throw new Error('module not found');
    });
    const loader = new DynamicImportIconLoader(resolver);

    await expect(loader.load('missing')).rejects.toThrow('module not found');
  });
});
