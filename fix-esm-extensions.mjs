#!/usr/bin/env node
/**
 * Post-processes `tsc`'s compiled output so relative import/export
 * specifiers carry an explicit `.js` extension, as plain Node ESM
 * `import` requires (bundlers and Vitest/Vite tolerate the missing
 * extension, which is how this shipped broken in oxide-icons@0.1.0
 * without a single test catching it — every test here runs through
 * Vite/Vitest resolution, never plain `node`).
 *
 * Run after `tsc` as part of `npm run build`, in both repos: this
 * file is synced to the public repo for exactly that reason, see
 * ADR-0018 and the SYNC_FILES entry in scripts/release-sync.mjs.
 *
 * Usage: node fix-esm-extensions.mjs [distDir]
 * Defaults to ./dist relative to cwd.
 */

import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const distDir = path.resolve(process.cwd(), process.argv[2] ?? 'dist');

/**
 * Matches a relative import/export specifier with no extension:
 *   from './foo'          from "../bar/baz"          import('./foo')
 * Captures the quote char and the path, leaves everything else
 * (bare specifiers like 'vite', anything already with an extension)
 * untouched.
 */
const SPECIFIER_RE =
  /(\bfrom\s+|\bimport\s*\(\s*)(['"])(\.\.?\/[^'"]+?)\2/g;

/** Bare side-effect imports: `import './register';`, no `from`. */
const BARE_IMPORT_RE = /(\bimport\s+)(['"])(\.\.?\/[^'"]+?)\2/g;

const HAS_EXTENSION_RE = /\.[a-zA-Z0-9]+$/;

function listJsFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listJsFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      out.push(full);
    }
  }
  return out;
}

function resolveExtension(fromFile, specifier) {
  const base = path.resolve(path.dirname(fromFile), specifier);
  if (existsSync(base + '.js')) {
    return specifier + '.js';
  }
  if (existsSync(base) && statSync(base).isDirectory() && existsSync(path.join(base, 'index.js'))) {
    return specifier.replace(/\/$/, '') + '/index.js';
  }
  // Fall back to a plain `.js` append: covers the normal case even
  // when the target hasn't been written yet at the point this file
  // is processed (directory walk order isn't import-graph order).
  return specifier + '.js';
}

export function fixFileContent(filePath, content) {
  return content.replace(SPECIFIER_RE, (match, prefix, quote, specifier) => {
    if (HAS_EXTENSION_RE.test(specifier)) {
      return match;
    }
    const fixed = resolveExtension(filePath, specifier);
    return `${prefix}${quote}${fixed}${quote}`;
  });
}

function main() {
  if (!existsSync(distDir)) {
    console.error(`fix-esm-extensions: ${distDir} does not exist, run tsc first.`);
    process.exit(1);
  }

  const files = listJsFiles(distDir);
  let changed = 0;

  for (const file of files) {
    const original = readFileSync(file, 'utf8');
    const fixed = fixFileContent(file, original);
    if (fixed !== original) {
      writeFileSync(file, fixed);
      changed += 1;
    }
  }

  console.log(`fix-esm-extensions: patched ${changed} of ${files.length} file(s) in ${path.relative(process.cwd(), distDir) || '.'}`);
}

// Only run as a script, not when imported by the test. Uses
// `pathToFileURL`, not a naive `file://${process.argv[1]}` string
// concatenation: `process.argv[1]` is a plain path (backslashes on
// Windows), not a URL, and the naive version silently never matches
// there — `main()` never runs, the script exits 0 having patched
// nothing, no error at all. See ADR-0019 and the identical fix
// applied to `generate-catalog.mjs`'s own entry-point guard.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
