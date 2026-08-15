import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { toIconId, type FamilyId, type IconId, type Manifest, type ManifestBuilder } from '../domain';
import { iconNameFromFileName } from '../../shared/iconFileName';

/**
 * Builds the {@link Manifest} by reading the file system. Only
 * implementation of {@link ManifestBuilder} in v2, see ADR-0006.
 *
 * Convention (not previously written down elsewhere, fixed here):
 * every direct subdirectory of `iconsDir` is a family, and every icon
 * source file directly inside that subdirectory is one icon, named
 * after the file itself, extension removed (see
 * `iconNameFromFileName`, `src/shared/`, ADR-0015). Nesting deeper
 * than one level is not scanned, matching ADR-0005's decision against
 * the per-subcategory split that stalled the previous version of this
 * project.
 *
 * This builder never reads file contents. It only needs to know which
 * family serves which icon, per ADR-0004's Manifest vs Catalog
 * boundary, not what is inside an icon file, that is the concern of
 * whichever `IconLoader` later loads the family.
 */
export class FsManifestBuilder implements ManifestBuilder {
  /**
   * @throws if two icon source files in the same family directory
   * resolve to the same icon id (e.g. `add.ts` and `add.js` side by
   * side). That almost always means an in-progress rename or a
   * leftover file, not two valid icons, silently picking one would
   * hide it. The error names both paths involved.
   */
  async build(iconsDir: string): Promise<Manifest> {
    const entries = new Map<IconId, FamilyId>();
    const firstPathById = new Map<IconId, string>();
    const topLevel = await readdir(iconsDir, { withFileTypes: true });
    const families = topLevel.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();

    for (const family of families) {
      const familyDir = join(iconsDir, family);
      const iconFiles = await readdir(familyDir, { withFileTypes: true });
      const iconFileNames = iconFiles
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .sort();

      for (const fileName of iconFileNames) {
        const name = iconNameFromFileName(fileName);
        if (name === null) {
          continue;
        }

        const id = toIconId(family, name);
        const path = join(familyDir, fileName);
        const firstPath = firstPathById.get(id);

        if (firstPath) {
          throw new Error(
            `FsManifestBuilder: duplicate icon id "${id}", first registered from "${firstPath}", second from "${path}".`
          );
        }

        entries.set(id, family);
        firstPathById.set(id, path);
      }
    }

    return entries;
  }
}
