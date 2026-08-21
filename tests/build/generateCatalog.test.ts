import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { scanIcons, iconNameFromFileName } from '../../generate-catalog.mjs';

const scriptPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../generate-catalog.mjs'
);

let tmpRoot: string;

beforeEach(() => {
  tmpRoot = mkdtempSync(path.join(os.tmpdir(), 'generate-catalog-'));
});

afterEach(() => {
  rmSync(tmpRoot, { recursive: true, force: true });
});

function writeIcon(family: string, fileName: string) {
  const dir = path.join(tmpRoot, family);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, fileName), 'export default { viewBox: "0 0 24 24", body: "" };\n');
}

describe('iconNameFromFileName', () => {
  it('strips a recognized extension', () => {
    expect(iconNameFromFileName('add.ts')).toBe('add');
    expect(iconNameFromFileName('add.js')).toBe('add');
  });

  it('returns null for an unrecognized extension', () => {
    expect(iconNameFromFileName('README.md')).toBeNull();
    expect(iconNameFromFileName('add.svg')).toBeNull();
  });

  it('returns null for a dotfile with no extension of its own', () => {
    expect(iconNameFromFileName('.gitignore')).toBeNull();
  });
});

describe('scanIcons', () => {
  it('groups icons by their immediate parent directory (family)', () => {
    writeIcon('ui', 'add.ts');
    writeIcon('ui', 'close.ts');
    writeIcon('arrows', 'up.ts');

    const byFamily = scanIcons(tmpRoot);

    expect([...byFamily.keys()].sort()).toEqual(['arrows', 'ui']);
    expect(byFamily.get('ui')?.map((i: { name: string }) => i.name).sort()).toEqual(['add', 'close']);
    expect(byFamily.get('arrows')?.map((i: { name: string }) => i.name)).toEqual(['up']);
  });

  it('ignores files without a recognized icon source extension', () => {
    writeIcon('ui', 'add.ts');
    writeIcon('ui', 'README.md');

    const byFamily = scanIcons(tmpRoot);

    expect(byFamily.get('ui')?.map((i: { name: string }) => i.name)).toEqual(['add']);
  });

  it('does not scan more than one level deep', () => {
    writeIcon('ui', 'add.ts');
    mkdirSync(path.join(tmpRoot, 'ui', 'nested'), { recursive: true });
    writeFileSync(path.join(tmpRoot, 'ui', 'nested', 'deep.ts'), 'export default {};\n');

    const byFamily = scanIcons(tmpRoot);

    expect(byFamily.get('ui')?.map((i: { name: string }) => i.name)).toEqual(['add']);
  });

  it('omits a family directory that has no recognized icon files', () => {
    mkdirSync(path.join(tmpRoot, 'empty'), { recursive: true });
    writeIcon('ui', 'add.ts');

    const byFamily = scanIcons(tmpRoot);

    expect([...byFamily.keys()]).toEqual(['ui']);
  });

  it('throws on two files resolving to the same icon id within a family', () => {
    writeIcon('ui', 'add.ts');
    writeIcon('ui', 'add.js');

    expect(() => scanIcons(tmpRoot)).toThrow(/duplicate icon id "ui:add"/);
  });
});

describe('running the script for real, as a child process', () => {
  it('actually runs main() and writes src/generated/ — regression guard for the entry-point check', () => {
    writeIcon('ui', 'add.ts');

    const outDir = path.join(tmpRoot, 'out');
    const output = execFileSync(process.execPath, [scriptPath, tmpRoot, outDir]).toString();

    // Would silently print nothing and write nothing if the script's
    // own `if (import.meta.url === ...)` entry-point guard failed to
    // match — exactly the bug this test exists to catch, see the
    // guard's own comment in generate-catalog.mjs.
    expect(output).toMatch(/generate-catalog: wrote 1 family module\(s\), 1 icon\(s\)/);
    expect(() => statSync(path.join(outDir, 'manifest.ts'))).not.toThrow();
  });
});
