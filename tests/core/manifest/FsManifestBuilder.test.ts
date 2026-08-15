import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FsManifestBuilder } from '../../../src/core/manifest/FsManifestBuilder';
import { toIconId } from '../../../src/core/domain';

describe('FsManifestBuilder', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'oxide-icons-manifest-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('returns an empty manifest for an empty icons directory', async () => {
    const builder = new FsManifestBuilder();

    const manifest = await builder.build(dir);

    expect(manifest.size).toBe(0);
  });

  it('maps each icon file to its family, by directory name and file name', async () => {
    await mkdir(join(dir, 'ui'));
    await writeFile(join(dir, 'ui', 'add.ts'), 'export default {}');
    await writeFile(join(dir, 'ui', 'edit.ts'), 'export default {}');
    await mkdir(join(dir, 'arrows'));
    await writeFile(join(dir, 'arrows', 'left.ts'), 'export default {}');

    const builder = new FsManifestBuilder();
    const manifest = await builder.build(dir);

    expect(manifest.get(toIconId('ui', 'add'))).toBe('ui');
    expect(manifest.get(toIconId('ui', 'edit'))).toBe('ui');
    expect(manifest.get(toIconId('arrows', 'left'))).toBe('arrows');
    expect(manifest.size).toBe(3);
  });

  it('treats .js and .ts icon files the same way', async () => {
    await mkdir(join(dir, 'ui'));
    await writeFile(join(dir, 'ui', 'add.js'), 'export default {}');

    const builder = new FsManifestBuilder();
    const manifest = await builder.build(dir);

    expect(manifest.get(toIconId('ui', 'add'))).toBe('ui');
  });

  it('ignores files directly inside the icons directory, only subdirectories are families', async () => {
    await writeFile(join(dir, 'stray.ts'), 'export default {}');
    await mkdir(join(dir, 'ui'));
    await writeFile(join(dir, 'ui', 'add.ts'), 'export default {}');

    const builder = new FsManifestBuilder();
    const manifest = await builder.build(dir);

    expect(manifest.size).toBe(1);
    expect(manifest.has(toIconId('ui', 'add'))).toBe(true);
  });

  it('ignores non icon files inside a family directory', async () => {
    await mkdir(join(dir, 'ui'));
    await writeFile(join(dir, 'ui', 'add.ts'), 'export default {}');
    await writeFile(join(dir, 'ui', 'README.md'), '# notes');
    await writeFile(join(dir, 'ui', '.DS_Store'), '');

    const builder = new FsManifestBuilder();
    const manifest = await builder.build(dir);

    expect(manifest.size).toBe(1);
  });

  it('does not scan deeper than one level inside a family directory', async () => {
    await mkdir(join(dir, 'ui', 'nested'), { recursive: true });
    await writeFile(join(dir, 'ui', 'nested', 'ignored.ts'), 'export default {}');
    await writeFile(join(dir, 'ui', 'add.ts'), 'export default {}');

    const builder = new FsManifestBuilder();
    const manifest = await builder.build(dir);

    expect(manifest.size).toBe(1);
    expect(manifest.has(toIconId('ui', 'add'))).toBe(true);
  });

  it('treats extensions case-insensitively', async () => {
    await mkdir(join(dir, 'ui'));
    await writeFile(join(dir, 'ui', 'ADD.TS'), 'export default {}');

    const builder = new FsManifestBuilder();
    const manifest = await builder.build(dir);

    expect(manifest.get(toIconId('ui', 'ADD'))).toBe('ui');
  });

  it('throws when two files in the same family resolve to the same icon id', async () => {
    await mkdir(join(dir, 'ui'));
    await writeFile(join(dir, 'ui', 'add.ts'), 'export default {}');
    await writeFile(join(dir, 'ui', 'add.js'), 'export default {}');

    const builder = new FsManifestBuilder();

    await expect(builder.build(dir)).rejects.toThrow(/duplicate icon id/);
  });

  it('returns entries in a deterministic order regardless of file system order', async () => {
    await mkdir(join(dir, 'zebra'));
    await writeFile(join(dir, 'zebra', 'stripe.ts'), 'export default {}');
    await mkdir(join(dir, 'alpha'));
    await writeFile(join(dir, 'alpha', 'omega.ts'), 'export default {}');
    await writeFile(join(dir, 'alpha', 'beta.ts'), 'export default {}');

    const builder = new FsManifestBuilder();
    const manifest = await builder.build(dir);

    expect([...manifest.keys()]).toEqual([
      toIconId('alpha', 'beta'),
      toIconId('alpha', 'omega'),
      toIconId('zebra', 'stripe'),
    ]);
  });
});
