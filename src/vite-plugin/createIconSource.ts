import type { FamilyId, IconId, Manifest } from '../core/domain';
import { toIconId } from '../core/domain';
import { DynamicImportIconLoader, type FamilyModule, type FamilyModuleResolver, type IconModuleEntry } from '../core/loader/DynamicImportIconLoader';
import { iconNameFromFileName } from '../shared/iconFileName';

/** The result shape of a Vite `import.meta.glob(...)` call. */
export type IconGlobModules = Record<string, () => Promise<{ default: IconModuleEntry }>>;

export interface IconSource {
  manifest: Manifest;
  loader: DynamicImportIconLoader;
}

function parseIconPath(path: string): { family: FamilyId; name: string } | null {
  const segments = path.split('/');
  const fileName = segments[segments.length - 1];
  const family = segments[segments.length - 2];
  if (!fileName || !family) {
    return null;
  }

  const name = iconNameFromFileName(fileName);
  if (name === null) {
    return null;
  }

  return { family, name };
}

/**
 * Turns an already-called `import.meta.glob` result into a
 * {@link Manifest} plus a ready {@link DynamicImportIconLoader}, see
 * ADR-0014. Never calls `import.meta.glob` itself, that call must be
 * written literally in the consumer's own source for Vite to analyze
 * it, this function only transforms its result.
 *
 * @throws if two glob entries resolve to the same {@link IconId}. The
 * error names both paths involved.
 */
export function createIconSource(glob: IconGlobModules): IconSource {
  const manifestEntries = new Map<IconId, FamilyId>();
  const firstPathById = new Map<IconId, string>();
  const byFamily = new Map<FamilyId, Map<string, () => Promise<{ default: IconModuleEntry }>>>();

  for (const [path, importFn] of Object.entries(glob)) {
    const parsed = parseIconPath(path);
    if (!parsed) {
      continue;
    }

    const { family, name } = parsed;
    const id = toIconId(family, name);
    const firstPath = firstPathById.get(id);

    if (firstPath) {
      throw new Error(
        `createIconSource: duplicate icon id "${id}", first registered from "${firstPath}", second from "${path}".`
      );
    }

    manifestEntries.set(id, family);
    firstPathById.set(id, path);

    let familyIcons = byFamily.get(family);
    if (!familyIcons) {
      familyIcons = new Map();
      byFamily.set(family, familyIcons);
    }
    familyIcons.set(name, importFn);
  }

  const resolveFamilyModule: FamilyModuleResolver = async (family) => {
    const icons = byFamily.get(family);
    if (!icons) {
      throw new Error(`createIconSource: no icons found for family "${family}".`);
    }

    const entries: FamilyModule = {};
    await Promise.all(
      [...icons.entries()].map(async ([name, importFn]) => {
        try {
          const mod = await importFn();
          entries[name] = mod.default;
        } catch (cause) {
          throw new Error(`createIconSource: failed loading "${toIconId(family, name)}".`, { cause });
        }
      })
    );

    return { default: entries };
  };

  return {
    manifest: manifestEntries,
    loader: new DynamicImportIconLoader(resolveFamilyModule),
  };
}
