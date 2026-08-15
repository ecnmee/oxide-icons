import type {
  FamilyId,
  IconCatalog,
  IconData,
  IconId,
  IconLoader,
  IconRegistry,
  Manifest,
} from '../domain';

/**
 * Only implementation of {@link IconRegistry} in v2, see ADR-0007 for
 * why it is named plainly `Registry`: it is not a swappable strategy,
 * it is the single coordination algorithm, see ADR-0004's typology.
 *
 * Coordinates a {@link Manifest} (what exists), an {@link IconCatalog}
 * (what is loaded), and per-family {@link IconLoader}s (how to load),
 * following the 4-step algorithm from ADR-0004, "Manifest vs Catalog
 * boundary":
 *
 * 1. Ask the Manifest if the id exists. Not there, throw.
 * 2. In the Catalog already? Done, nothing to do.
 * 3. Not there, ask the Loader for the id's family to load it.
 * 4. Hand the result to the Catalog.
 */
export class Registry implements IconRegistry {
  private readonly loaders = new Map<FamilyId, IconLoader>();

  /**
   * Families currently being loaded, keyed by family, valued by the
   * in-flight load promise. See ADR-0004, "Icon lifecycle",
   * "Concurrency": concurrent {@link ensureLoaded} calls for the same
   * not-yet-loaded family must share this same promise, never trigger
   * a second call to that family's loader. Entries are removed once
   * the load settles, successfully or not, so a later call can retry
   * a family whose previous load failed (see ADR-0004: retry policy on
   * FAILED is otherwise left undefined, this at least does not
   * permanently wedge a family that failed once).
   */
  private readonly loadingFamilies = new Map<FamilyId, Promise<void>>();

  constructor(
    private readonly manifest: Manifest,
    private readonly catalog: IconCatalog
  ) {}

  registerLoader(family: FamilyId, loader: IconLoader): void {
    this.loaders.set(family, loader);
  }

  async ensureLoaded(id: IconId): Promise<void> {
    const family = this.manifest.get(id);
    if (family === undefined) {
      throw new Error(`Registry: icon not found: "${id}".`);
    }

    if (this.catalog.has(id)) {
      return;
    }

    await this.ensureFamilyLoaded(family);

    if (!this.catalog.has(id)) {
      throw new Error(
        `Registry: icon "${id}" is listed in the manifest for family "${family}", but the loader for that family did not provide it.`
      );
    }
  }

  get(id: IconId): IconData | null {
    return this.catalog.get(id);
  }

  has(id: IconId): boolean {
    return this.catalog.has(id);
  }

  private ensureFamilyLoaded(family: FamilyId): Promise<void> {
    if (this.catalog.hasFamily(family)) {
      return Promise.resolve();
    }

    const inFlight = this.loadingFamilies.get(family);
    if (inFlight) {
      return inFlight;
    }

    const loadPromise = this.loadFamily(family).finally(() => {
      this.loadingFamilies.delete(family);
    });

    this.loadingFamilies.set(family, loadPromise);
    return loadPromise;
  }

  private async loadFamily(family: FamilyId): Promise<void> {
    const loader = this.loaders.get(family);
    if (!loader) {
      throw new Error(`Registry: no loader registered for family "${family}".`);
    }

    const icons = await loader.load(family);
    this.catalog.add(icons);
    this.catalog.markFamilyLoaded(family);
  }
}
