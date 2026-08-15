/**
 * Public API of `core/domain`.
 *
 * Explicit re-exports (not `export *`): a deliberate decision so the
 * domain's public API stays intentional and never accidentally exposes
 * something added later to one of the internal modules.
 */

export type { FamilyId, IconId, IconData } from './icon';
export { toIconId } from './icon';

export type { Manifest, ManifestBuilder } from './manifest';

export type {
  IsolationMode,
  IconContext,
  ContextResolution,
  ContextResolver,
} from './context';

export type { IconCatalog } from './catalog';

export type { IconLoader } from './loader';

export type { IconRegistry } from './registry';

export type { RenderOptions, Renderer } from './renderer';
