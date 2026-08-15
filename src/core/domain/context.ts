import type { FamilyId } from './icon';

/**
 * Isolation mode between icon families (see ADR-0002/0004):
 *
 * - `"soft"`: allows icons from another family, but flags it in the
 *   result (`reason: 'soft-mismatch'`, `message` set). Default.
 * - `"exclusive"`: reports the mismatch as not allowed
 *   (`reason: 'exclusive-block'`); the caller decides that means not
 *   rendering the icon.
 * - `"strict"`: reports the mismatch as not allowed
 *   (`reason: 'strict-block'`); the caller decides that means
 *   throwing. `ContextResolver` itself never throws, see ADR-0010.
 */
export type IsolationMode = 'soft' | 'exclusive' | 'strict';

/**
 * Environmental state, normally built from the ascendant DOM (the
 * `data-icon-family`/`data-icon-isolation` attributes), stating which
 * family is expected in this area of the application.
 */
export interface IconContext {
  family: FamilyId;
  mode: IsolationMode;
  /**
   * True if this context was inherited from a DOM ancestor, false if
   * declared directly on the element requesting the icon. Set by
   * whoever builds the `IconContext` from the DOM, `ContextResolver`
   * cannot determine this itself, see ADR-0010.
   */
  inherited: boolean;
}

/**
 * Closed set of outcomes `ContextResolver.resolve()` can report, see
 * ADR-0010 (replaces a free `string`, agreed but unresolved since the
 * `MemoryIconCatalog`/`FsManifestBuilder` review).
 */
export type ContextResolutionReason =
  | 'no-context'
  | 'match'
  | 'soft-mismatch'
  | 'exclusive-block'
  | 'strict-block';

/**
 * Result of resolving context for an icon of a given family. `<ox-icon>`
 * never recomputes anything from this, it uses the result as returned
 * (see ADR-0005, revision 2026-07-09).
 */
export interface ContextResolution {
  allowed: boolean;
  reason: ContextResolutionReason;
  message: string | null;
  /** Family that effectively applies after resolving inheritance. */
  effectiveFamily: FamilyId;
  mode: IsolationMode;
  /** `true` if `context` came from a DOM ancestor, not a direct attribute. */
  inherited: boolean;
}

/**
 * Decides whether an icon from one family can be used inside a context
 * belonging to another family. Lives in the Core (ADR-0002, decision
 * closed 2026-07-08): the Web Component only builds the
 * {@link IconContext} from the DOM and calls this, it never decides,
 * never recomputes. Pure: never throws, never touches the DOM, see
 * ADR-0009 and ADR-0010.
 */
export interface ContextResolver {
  resolve(iconFamily: FamilyId, context: IconContext | null): ContextResolution;
}
