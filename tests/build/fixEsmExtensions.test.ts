import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { fixFileContent } from '../../fix-esm-extensions.mjs';

let tmpRoot: string;

beforeEach(() => {
  tmpRoot = mkdtempSync(path.join(os.tmpdir(), 'esm-fix-'));
});

afterEach(() => {
  rmSync(tmpRoot, { recursive: true, force: true });
});

function write(relPath: string, content: string): string {
  const full = path.join(tmpRoot, relPath);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, content);
  return full;
}

describe('fixFileContent', () => {
  it('adds .js to a same-directory relative import', () => {
    write('index.js', "export const x = 1;\n");
    const target = write('caller.js', "import { x } from './index';\n");

    const fixed = fixFileContent(target, readFileSync(target, 'utf8'));

    expect(fixed).toBe("import { x } from './index.js';\n");
  });

  it('adds .js to a parent-directory relative import', () => {
    write('lib/thing.js', "export const y = 2;\n");
    const target = write('src/caller.js', "import { y } from '../lib/thing';\n");

    const fixed = fixFileContent(target, readFileSync(target, 'utf8'));

    expect(fixed).toBe("import { y } from '../lib/thing.js';\n");
  });

  it('resolves a directory import to /index.js', () => {
    write('sub/index.js', "export const z = 3;\n");
    const target = write('caller.js', "import { z } from './sub';\n");

    const fixed = fixFileContent(target, readFileSync(target, 'utf8'));

    expect(fixed).toBe("import { z } from './sub/index.js';\n");
  });

  it('handles export ... from as well as import ... from', () => {
    write('inner.js', "export const w = 4;\n");
    const target = write('reexport.js', "export { w } from './inner';\n");

    const fixed = fixFileContent(target, readFileSync(target, 'utf8'));

    expect(fixed).toBe("export { w } from './inner.js';\n");
  });

  it('handles dynamic import()', () => {
    write('lazy.js', "export const v = 5;\n");
    const target = write('caller.js', "const mod = await import('./lazy');\n");

    const fixed = fixFileContent(target, readFileSync(target, 'utf8'));

    expect(fixed).toBe("const mod = await import('./lazy.js');\n");
  });

  it('leaves an already-extensioned specifier untouched', () => {
    const target = write('caller.js', "import { x } from './index.js';\n");

    const fixed = fixFileContent(target, readFileSync(target, 'utf8'));

    expect(fixed).toBe("import { x } from './index.js';\n");
  });

  it('leaves a bare package specifier untouched', () => {
    const target = write('caller.js', "import { z } from 'vite';\n");

    const fixed = fixFileContent(target, readFileSync(target, 'utf8'));

    expect(fixed).toBe("import { z } from 'vite';\n");
  });

  it('fixes every relative specifier in a file with several imports', () => {
    write('a.js', 'export const a = 1;\n');
    write('b.js', 'export const b = 2;\n');
    const target = write(
      'caller.js',
      "import { a } from './a';\nimport { b } from './b';\nimport 'vite';\n"
    );

    const fixed = fixFileContent(target, readFileSync(target, 'utf8'));

    expect(fixed).toBe(
      "import { a } from './a.js';\nimport { b } from './b.js';\nimport 'vite';\n"
    );
  });
});
