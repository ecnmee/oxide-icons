import type { FamilyId, IconData, IconId } from './icon';

/**
 * Domain contract for storage of already-loaded icons.
 *
 * Knows how to store; it does not know how to load (that is
 * {@link IconLoader}) and does not know when to load what (that is
 * `IconRegistry`). See ADR-0006: `IconCatalog` was deliberately split
 * from the `IconRegistry` file because it represents a different
 * concept (domain contract vs domain service).
 *
 * "Catalog", not "Cache": it implies no eviction or expiry policy, it
 * only accumulates what was loaded. See ADR-0004, "Note on Cache vs
 * Catalog".
 */
export interface IconCatalog {
  /** @param icons see ADR-0008: readonly, the catalog only ever reads from it. */
  add(icons: readonly IconData[]): void;
  get(id: IconId): IconData | null;
  has(id: IconId): boolean;
  hasFamily(family: FamilyId): boolean;
  markFamilyLoaded(family: FamilyId): void;
}
