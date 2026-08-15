import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// Runs the real script (not a reimplementation) against real,
// throwaway git repos under the OS temp dir. No fixtures under
// tests/, nothing here ever touches the real oxide-icons-monorepo
// or oxide-icons repos.

const scriptPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../scripts/release-sync.mjs'
);

let tmpRoot: string;
let monorepo: string;
let publicRepo: string;

function sh(command: string, args: string[], cwd: string) {
  return execFileSync(command, args, { cwd, stdio: 'pipe' }).toString();
}

function git(args: string[], cwd: string) {
  return sh('git', args, cwd);
}

function gitInit(cwd: string) {
  mkdirSync(cwd, { recursive: true });
  git(['init', '-q'], cwd);
  git(['config', 'user.email', 'test@example.com'], cwd);
  git(['config', 'user.name', 'Test'], cwd);
}

function gitCommitAll(cwd: string, message: string) {
  git(['add', '.'], cwd);
  git(['commit', '-q', '-m', message], cwd);
}

/**
 * A minimal but real, runnable monorepo: `npm run typecheck/test/build`
 * are real npm scripts (no-op, via `node -e ""`), so the script's own
 * verification step runs for real, not mocked.
 */
function seedMonorepo(cwd: string) {
  mkdirSync(path.join(cwd, 'src', 'core'), { recursive: true });
  mkdirSync(path.join(cwd, 'tests'), { recursive: true });
  mkdirSync(path.join(cwd, 'examples', 'basic'), { recursive: true });
  mkdirSync(path.join(cwd, 'docs', 'en', 'concepts'), { recursive: true });
  mkdirSync(path.join(cwd, 'docs', 'pt', 'concepts'), { recursive: true });

  writeFileSync(path.join(cwd, 'src', 'core', 'thing.ts'), 'export const thing = 1;\n');
  writeFileSync(path.join(cwd, 'tests', 'thing.test.ts'), '// placeholder\n');
  writeFileSync(path.join(cwd, 'examples', 'basic', 'main.ts'), '// placeholder\n');
  writeFileSync(
    path.join(cwd, 'docs', 'en', 'concepts', 'families-and-isolation.md'),
    '# Concepts EN\n'
  );
  writeFileSync(
    path.join(cwd, 'docs', 'pt', 'concepts', 'families-and-isolation.md'),
    '# Concepts PT\n'
  );
  writeFileSync(path.join(cwd, 'LICENSE'), 'MIT\n');
  writeFileSync(path.join(cwd, 'tsconfig.json'), '{}\n');
  writeFileSync(path.join(cwd, 'vitest.config.ts'), 'export default {};\n');
  writeFileSync(path.join(cwd, 'package-lock.json'), '{}\n');
  writeFileSync(
    path.join(cwd, 'package.json'),
    JSON.stringify(
      {
        name: 'fixture-monorepo',
        version: '0.0.0',
        private: true,
        scripts: {
          typecheck: 'node -e ""',
          test: 'node -e ""',
          build: 'node -e ""',
        },
      },
      null,
      2
    )
  );
}

/** A minimal, real public repo: hand-authored README that must survive sync untouched. */
function seedPublicRepo(cwd: string) {
  writeFileSync(path.join(cwd, 'README.md'), '# Hand-authored public README\n');
  mkdirSync(path.join(cwd, 'assets'), { recursive: true });
  writeFileSync(path.join(cwd, 'assets', 'logo.png'), 'not-a-real-png\n');
}

beforeEach(() => {
  tmpRoot = mkdtempSync(path.join(os.tmpdir(), 'oxide-release-sync-'));
  monorepo = path.join(tmpRoot, 'oxide-icons-monorepo');
  publicRepo = path.join(tmpRoot, 'oxide-icons');

  gitInit(monorepo);
  seedMonorepo(monorepo);
  gitCommitAll(monorepo, 'seed');

  gitInit(publicRepo);
  seedPublicRepo(publicRepo);
  gitCommitAll(publicRepo, 'seed');
});

afterEach(() => {
  rmSync(tmpRoot, { recursive: true, force: true });
});

function runSync(extraArgs: string[] = []) {
  return sh('node', [scriptPath, '--public', publicRepo, ...extraArgs], monorepo);
}

describe('release-sync.mjs, run for real against temp git repos', () => {
  it('refuses to run when the monorepo has uncommitted changes', () => {
    writeFileSync(path.join(monorepo, 'src', 'core', 'thing.ts'), 'export const thing = 2;\n');

    expect(() => runSync()).toThrow();
  });

  it('refuses to run when the public repo has uncommitted changes', () => {
    writeFileSync(path.join(publicRepo, 'README.md'), '# locally edited, not committed\n');

    expect(() => runSync()).toThrow();
  });

  it('--dry-run writes nothing', () => {
    runSync(['--dry-run']);

    expect(existsSync(path.join(publicRepo, 'src'))).toBe(false);
  });

  it('syncs src/tests/examples, config files, and the docs rename mapping', () => {
    runSync();

    expect(readFileSync(path.join(publicRepo, 'src', 'core', 'thing.ts'), 'utf8')).toContain(
      'thing = 1'
    );
    expect(existsSync(path.join(publicRepo, 'tests', 'thing.test.ts'))).toBe(true);
    expect(existsSync(path.join(publicRepo, 'examples', 'basic', 'main.ts'))).toBe(true);
    expect(readFileSync(path.join(publicRepo, 'LICENSE'), 'utf8')).toBe('MIT\n');
    expect(readFileSync(path.join(publicRepo, 'docs', 'concepts.md'), 'utf8')).toBe(
      '# Concepts EN\n'
    );
    expect(readFileSync(path.join(publicRepo, 'docs', 'concepts.pt.md'), 'utf8')).toBe(
      '# Concepts PT\n'
    );
  });

  it('never touches README.md or assets/ in the public repo', () => {
    runSync();

    expect(readFileSync(path.join(publicRepo, 'README.md'), 'utf8')).toBe(
      '# Hand-authored public README\n'
    );
    expect(readFileSync(path.join(publicRepo, 'assets', 'logo.png'), 'utf8')).toBe(
      'not-a-real-png\n'
    );
  });

  it('removes a stale file from a previous sync that no longer exists in the source', () => {
    runSync();
    gitCommitAll(publicRepo, 'first sync');

    rmSync(path.join(monorepo, 'src', 'core', 'thing.ts'));
    writeFileSync(path.join(monorepo, 'src', 'core', 'renamed.ts'), 'export const thing = 1;\n');
    gitCommitAll(monorepo, 'rename file');

    runSync();

    expect(existsSync(path.join(publicRepo, 'src', 'core', 'thing.ts'))).toBe(false);
    expect(existsSync(path.join(publicRepo, 'src', 'core', 'renamed.ts'))).toBe(true);
  });

  it('running it twice in a row with no monorepo changes produces no diff', () => {
    runSync();
    gitCommitAll(publicRepo, 'first sync');

    runSync();

    expect(git(['status', '--porcelain'], publicRepo).trim()).toBe('');
  });

  it('never runs npm publish, never flips private, never commits in the public repo', () => {
    runSync();

    const pkg = JSON.parse(readFileSync(path.join(publicRepo, 'package.json'), 'utf8'));
    expect(pkg.private).toBe(true);
    // still uncommitted: the script writes the working tree only
    expect(git(['status', '--porcelain'], publicRepo).trim()).not.toBe('');
  });
});
