import { describe, expect, it } from 'vitest';
import { createIconSource, type IconGlobModules } from '../../src/vite-plugin/createIconSource';
import { toIconId } from '../../src/core/domain';

// Real import.meta.glob, against real fixture files, not mocks, same
// discipline as FsManifestBuilder's real-filesystem tests.
const glob = import.meta.glob('./fixtures/icons/*/*.ts') as IconGlobModules;

describe('createIconSource', () => {
  it('builds a manifest with one entry per real fixture icon file', () => {
    const { manifest } = createIconSource(glob);

    expect(manifest.get(toIconId('ui', 'add'))).toBe('ui');
    expect(manifest.get(toIconId('ui', 'edit'))).toBe('ui');
    expect(manifest.get(toIconId('arrows', 'left'))).toBe('arrows');
    expect(manifest.size).toBe(3);
  });

  it('loads a family, returning real IconData built from the actual fixture module', async () => {
    const { loader } = createIconSource(glob);

    const icons = await loader.load('ui');

    expect(icons).toHaveLength(2);
    const add = icons.find((icon) => icon.name === 'add');
    expect(add).toEqual({
      id: toIconId('ui', 'add'),
      family: 'ui',
      name: 'add',
      viewBox: '0 0 24 24',
      body: '<line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />',
      tags: ['plus', 'create'],
    });
  });

  it('loads a different family independently', async () => {
    const { loader } = createIconSource(glob);

    const icons = await loader.load('arrows');

    expect(icons).toHaveLength(1);
    expect(icons[0]?.name).toBe('left');
  });

  it('throws when asked to load a family with no icons', async () => {
    const { loader } = createIconSource(glob);

    await expect(loader.load('nonexistent')).rejects.toThrow(/no icons found/);
  });

  it('throws on duplicate icon ids across glob entries', () => {
    const duplicateGlob: IconGlobModules = {
      './fixtures/icons/ui/add.ts': async () => ({ default: { viewBox: '0 0 24 24', body: '<a/>' } }),
      './other/ui/add.ts': async () => ({ default: { viewBox: '0 0 24 24', body: '<b/>' } }),
    };

    expect(() => createIconSource(duplicateGlob)).toThrow(/duplicate icon id/);
  });

  it('ignores glob entries with an extension other than .ts/.js', () => {
    const messyGlob: IconGlobModules = {
      './fixtures/icons/ui/add.ts': async () => ({ default: { viewBox: '0 0 24 24', body: '<a/>' } }),
      './fixtures/icons/ui/README.md': async () => ({ default: { viewBox: '0 0 24 24', body: '<b/>' } }),
    };

    const { manifest } = createIconSource(messyGlob);

    expect(manifest.size).toBe(1);
    expect(manifest.has(toIconId('ui', 'add'))).toBe(true);
  });
});
