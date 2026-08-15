import type { FamilyId, IconData, IconId } from './icon';
import type { IconLoader } from './loader';

/**
 * Domain service (not a strategy contract, see ADR-0006, typology
 * table) that coordinates `Manifest` plus {@link IconLoader} plus
 * `IconCatalog`. The single entry point for the rest of the system to
 * obtain an icon.
 *
 * Does not store icons, does not load icons. It decides, from the
 * {@link IconId}, which family to trigger and delegates (see ADR-0004,
 * "Manifest vs Catalog boundary", 4-step algorithm).
 */
export interface IconRegistry {
  registerLoader(family: FamilyId, loader: IconLoader): void;

  /**
   * Ensures the family of `id` is in the catalog before returning it.
   *
   * Concurrent calls for the same not-yet-loaded family must share the
   * same in-flight load operation, never trigger parallel calls to the
   * {@link IconLoader}, see ADR-0004, "Icon lifecycle", "Concurrency"
   * section.
   */
  ensureLoaded(id: IconId): Promise<void>;

  get(id: IconId): IconData | null;
  has(id: IconId): boolean;
}
