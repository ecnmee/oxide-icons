import type { FamilyId, IconId } from './icon';

/**
 * Index generated at build time: for each {@link IconId}, the family
 * that serves it. States what exists. It never states what is loaded
 * at runtime, that is the responsibility of `IconCatalog` (see
 * ADR-0004, "Manifest vs Catalog boundary").
 *
 * `ReadonlyMap`, not `Record`/plain object: the manifest is a queried
 * index (`has`/`get`), not a configuration object, and immutability is
 * explicit in the type instead of depending on `Object.freeze`
 * discipline at runtime (see ADR-0005).
 */
export type Manifest = ReadonlyMap<IconId, FamilyId>;

/**
 * Generates the {@link Manifest} from the project's icon tree. Exists
 * only at build time: no implementation of this contract ships in the
 * published bundle (see ADR-0002, principle 11: no Core contract
 * depends on details of a concrete strategy, including here "where"
 * and "how" icon files are read).
 */
export interface ManifestBuilder {
  /**
   * @param iconsDir path to the root of the icon tree to index
   * @returns the resulting {@link Manifest}
   */
  build(iconsDir: string): Promise<Manifest>;
}
