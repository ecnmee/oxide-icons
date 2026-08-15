import type { FamilyId, IconCatalog, IconData, IconId } from '../domain';

/**
 * In-memory implementation of {@link IconCatalog}. Backed by a `Map`
 * for icons and a `Set` for families marked as loaded.
 *
 * Stores what it is given. Does not load anything, does not decide
 * when it is called, see ADR-0006: `IconCatalog` is a storage
 * contract, `IconRegistry` is the coordinator.
 */
export class MemoryIconCatalog implements IconCatalog {
  private readonly icons = new Map<IconId, IconData>();
  private readonly loadedFamilies = new Set<FamilyId>();

  /**
   * @param icons see ADR-0008 for why this is `readonly`.
   * @throws if any icon's id is already present in the catalog, or if
   * two icons within the same call share an id. Two icons sharing an
   * id almost always means a duplicate icon source file or a broken
   * loader, silently overwriting would hide that. Atomic: validates
   * the whole batch before inserting anything, a rejected call leaves
   * the catalog exactly as it was before, no partial insert.
   */
  add(icons: readonly IconData[]): void {
    const idsInThisBatch = new Set<IconId>();

    for (const icon of icons) {
      if (this.icons.has(icon.id) || idsInThisBatch.has(icon.id)) {
        throw new Error(
          `MemoryIconCatalog: duplicate icon id "${icon.id}", an icon with this id is already in the catalog.`
        );
      }
      idsInThisBatch.add(icon.id);
    }

    for (const icon of icons) {
      this.icons.set(icon.id, icon);
    }
  }

  get(id: IconId): IconData | null {
    return this.icons.get(id) ?? null;
  }

  has(id: IconId): boolean {
    return this.icons.has(id);
  }

  hasFamily(family: FamilyId): boolean {
    return this.loadedFamilies.has(family);
  }

  /**
   * Marks a family as loaded. Idempotent: calling this more than once
   * for the same family has no additional effect and never throws.
   * This was an open question in the {@link IconCatalog} contract,
   * closed here: see `notes/en/engineering-backlog.md`.
   */
  markFamilyLoaded(family: FamilyId): void {
    this.loadedFamilies.add(family);
  }
}
