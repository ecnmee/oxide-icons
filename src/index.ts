/**
 * Public API of `oxide-icons`. See ADR-0016.
 *
 * Importing this module registers the `<ox-icon>` custom element as a
 * side effect. It is safe to import more than once, and safe to import
 * alongside code that has already called
 * `customElements.define('ox-icon', ...)` itself.
 *
 * The named exports below are the building blocks
 * `examples/basic/main.ts` wires together by hand. Most consumers only
 * need the side effect above; these are for consumers assembling their
 * own `IconLoader`/`IconCatalog` strategy, or testing against fakes.
 */

import { OxIconElement } from './web-component/OxIconElement';

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
