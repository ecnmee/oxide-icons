import { toIconId, type FamilyId, type IconData, type IconLoader } from '../domain';

/**
 * Data for one icon as exported by a family module, everything
 * `DynamicImportIconLoader` does not derive itself (`id`, `family`,
 * `name` are added from the module's key and the requested family).
 */
export type IconModuleEntry = Omit<IconData, 'id' | 'family' | 'name'>;

/**
 * The shape a family module is expected to have: one entry per icon,
 * keyed by icon name, as the module's default export.
 */
export type FamilyModule = Record<string, IconModuleEntry>;

/**
 * Resolves a family to the dynamic `import()` of its module.
 *
 * Injected rather than assumed, on purpose: this keeps
 * `DynamicImportIconLoader` free of any assumption about file layout
 * or bundler, see ADR-0002 principle 11. It also matters technically,
 * bundlers such as Vite need to see a dynamic `import()` expression
 * literally at its call site to code-split correctly, so that
 * expression belongs in the caller's own source (e.g. the app's
 * `src/init.ts`, or a future generated family index), never hidden
 * inside a generic function in `core/loader`.
 *
 * How individual per-icon source files (see `FsManifestBuilder`'s
 * convention) become one importable module per family is a build step
 * that does not exist yet, see `notes/en/engineering-backlog.md`.
 */
export type FamilyModuleResolver = (family: FamilyId) => Promise<{ default: FamilyModule }>;

/**
 * Only implementation of {@link IconLoader} in v2, see ADR-0002
 * principle 4. Loads a family by resolving its module (via the
 * injected {@link FamilyModuleResolver}) and building one
 * {@link IconData} per entry in that module.
 */
export class DynamicImportIconLoader implements IconLoader {
  constructor(private readonly resolveFamilyModule: FamilyModuleResolver) {}

  async load(family: FamilyId): Promise<IconData[]> {
    const familyModule = await this.resolveFamilyModule(family);

    return Object.entries(familyModule.default).map(([name, entry]) => ({
      id: toIconId(family, name),
      family,
      name,
      ...entry,
    }));
  }
}
