/**
 * Public API of `oxide-icons`. See ADR-0016, amended by ADR-0019.
 *
 * Importing this module, as a side effect:
 *   1. configures `OxIconElement`'s four static dependencies
 *      (`manifest`, `registry`, `renderer`, `isolationPolicy`) against
 *      the generated catalog in `./generated/` (see ADR-0019,
 *      `scripts/generate-catalog.mjs`);
 *   2. THEN registers the `<ox-icon>` custom element — deliberately
 *      last, see the comment above that call below.
 *
 * `<ox-icon>` is therefore usable immediately after
 * `npm install oxide-icons`, with no manual wiring, no bundler-specific
 * glob, and no separate Vite plugin required for the default,
 * zero-config path. `oxide-icons/vite`'s `createIconSource` remains
 * available for consumers who want their own icon source instead of
 * the packaged catalog (e.g. a private in-app icon set) — nothing here
 * depends on it, and nothing there depends on this.
 *
 * It is safe to import this module more than once (module-level code
 * only runs once, on the first import), and safe to import alongside
 * code that has already called `customElements.define('ox-icon', ...)`
 * itself. Advanced consumers can still override any of the four
 * statics after import, e.g. to swap in their own `IconCatalog` or
 * `IconLoader` (see ADR-0012); this module only supplies the defaults.
 *
 * The named exports below are the same building blocks
 * `examples/basic/main.ts` used to assemble by hand. Most consumers
 * only need the side effect above; these remain for consumers
 * assembling their own strategy, or testing against fakes.
 */

import { OxIconElement } from './web-component/OxIconElement';
import { Registry } from './core/registry/Registry';
import { MemoryIconCatalog } from './core/catalog/MemoryIconCatalog';
import { IsolationPolicy } from './core/context/IsolationPolicy';
import { SvgIconRenderer } from './core/renderer/SvgIconRenderer';
import { DynamicImportIconLoader } from './core/loader/DynamicImportIconLoader';
import { GENERATED_MANIFEST } from './generated/manifest';
import { resolveGeneratedFamilyModule } from './generated/catalog';

const catalog = new MemoryIconCatalog();
const registry = new Registry(GENERATED_MANIFEST, catalog);
const loader = new DynamicImportIconLoader(resolveGeneratedFamilyModule);

// One DynamicImportIconLoader instance serves every generated family,
// same as examples/basic/main.ts, see ADR-0014.
for (const family of new Set(GENERATED_MANIFEST.values())) {
  registry.registerLoader(family, loader);
}

OxIconElement.manifest = GENERATED_MANIFEST;
OxIconElement.registry = registry;
OxIconElement.renderer = new SvgIconRenderer();
OxIconElement.isolationPolicy = new IsolationPolicy();

// `customElements.define()` runs LAST, deliberately, after every
// static above is set — not first. Per spec, `define()` synchronously
// upgrades any matching custom elements already present in the
// document (i.e. `<ox-icon>` written directly in static HTML, parsed
// before this module runs), firing `connectedCallback()` — and
// therefore `render()` — synchronously, inside this very call. Defining
// the element before the statics were set meant a real browser page
// with `<ox-icon>` in its markup hit
// "registry/renderer/isolationPolicy/manifest must be configured"
// on first load, even though the exact same sequence always worked
// when a test created the element only after the import had finished
// (jsdom via `document.createElement`, `verify-published-package.mjs`,
// `examples/basic`) — none of those exercise the synchronous-upgrade
// path at all, which is exactly why this went undetected until a real
// static HTML page was tried.
if (!customElements.get('ox-icon')) {
  customElements.define('ox-icon', OxIconElement);
}

export { OxIconElement } from './web-component/OxIconElement';
export { Registry } from './core/registry/Registry';
export { MemoryIconCatalog } from './core/catalog/MemoryIconCatalog';
export { IsolationPolicy } from './core/context/IsolationPolicy';
export { SvgIconRenderer } from './core/renderer/SvgIconRenderer';

export type {
  FamilyId,
  IconId,
  IconData,
  Manifest,
  ManifestBuilder,
  IsolationMode,
  IconContext,
  ContextResolution,
  ContextResolver,
  IconCatalog,
  IconLoader,
  IconRegistry,
  RenderOptions,
  Renderer,
} from './core/domain';
export { toIconId } from './core/domain';
