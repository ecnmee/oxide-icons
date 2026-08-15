import type { FamilyId, IconData } from './icon';

/**
 * Strategy for obtaining the {@link IconData} of a family.
 *
 * Does not know how to store (that is `IconCatalog`) or when it is
 * called (that is `IconRegistry`), see ADR-0002, principle 4 ("loader
 * as strategy") and principle 11 ("no Core contract depends on details
 * of a concrete strategy": this contract assumes no dynamic import,
 * HTTP, sprite, or any other origin).
 *
 * Always loads the whole family at once, there is no "load a single
 * icon" (see ADR-0004, "Icon lifecycle", note on granularity).
 */
export interface IconLoader {
  load(family: FamilyId): Promise<IconData[]>;
}
