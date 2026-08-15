import type {
  ContextResolver,
  IconContext,
  IconRegistry,
  IsolationMode,
  Manifest,
  RenderOptions,
  Renderer,
} from '../core/domain';
import { toIconId } from '../core/domain';

const OBSERVED_ATTRIBUTES = [
  'name',
  'family',
  'size',
  'color',
  'stroke-width',
  'data-icon-family',
  'data-icon-isolation',
] as const;

/**
 * The public Web Component, `<ox-icon>`. Thin per ADR-0002 principle
 * 6: resolves attributes, asks the Core, injects the result, no
 * business rules of its own. Full design in ADR-0011, amended by
 * ADR-0012, error handling corrected by ADR-0013.
 *
 * Dependencies (`registry`, `renderer`, `isolationPolicy`, and
 * `manifest`) are static, class-level, configured once before any
 * `<ox-icon>` connects, see ADR-0012. `manifest` is a fourth static
 * beyond the three ADR-0012 named explicitly: a synchronous "is this
 * id even in the manifest" check is needed before any async load
 * starts, and `IconRegistry.has()` checks the Catalog (what is
 * loaded), not the Manifest (what exists), see ADR-0004's Manifest vs
 * Catalog boundary, so the element needs direct read access to the
 * Manifest itself for that one check.
 *
 * Never throws, see ADR-0013: `connectedCallback` and
 * `attributeChangedCallback` are Custom Element Reactions, the HTML
 * spec reports exceptions thrown inside them rather than propagating
 * them to the caller (`appendChild`, `setAttribute`), so a `throw`
 * here would be visible but never catchable, no better than reporting
 * it directly. Every failure, validation or load, goes through
 * {@link reportError}: `console.error` plus a bubbling
 * `oxide-icon-error` event, and renders nothing.
 */
export class OxIconElement extends HTMLElement {
  static registry: IconRegistry | undefined;
  static renderer: Renderer | undefined;
  static isolationPolicy: ContextResolver | undefined;
  static manifest: Manifest | undefined;

  static get observedAttributes(): readonly string[] {
    return OBSERVED_ATTRIBUTES;
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    void this.render();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) {
      void this.render();
    }
  }

  /**
   * Every failure mode, synchronous validation or asynchronous load,
   * is caught here and handled the same way, see ADR-0013.
   */
  private async render(): Promise<void> {
    try {
      const ctor = this.constructor as typeof OxIconElement;
      const { registry, renderer, isolationPolicy, manifest } = ctor;

      if (!registry || !renderer || !isolationPolicy || !manifest) {
        throw new Error(
          'OxIconElement: registry, renderer, isolationPolicy, and manifest must be configured as static properties before any <ox-icon> connects.'
        );
      }

      const name = this.getAttribute('name');
      if (!name) {
        throw new Error('OxIconElement: the "name" attribute is required.');
      }

      const context = this.resolveContext();
      const family = this.getAttribute('family') ?? context?.family;
      if (!family) {
        throw new Error(
          'OxIconElement: no "family" attribute and no enclosing data-icon-family context, cannot determine the icon\'s family.'
        );
      }

      const resolution = isolationPolicy.resolve(family, context);

      if (resolution.reason === 'strict-block' || resolution.reason === 'exclusive-block') {
        if (resolution.reason === 'strict-block') {
          throw new Error(
            resolution.message ?? `OxIconElement: blocked by strict isolation (family "${family}").`
          );
        }
        this.clear();
        return;
      }

      if (resolution.reason === 'soft-mismatch' && resolution.message) {
        console.warn(resolution.message);
      }

      const id = toIconId(family, name);

      if (!manifest.has(id)) {
        throw new Error(`OxIconElement: icon "${id}" is not in the manifest.`);
      }

      await registry.ensureLoaded(id);
      const icon = registry.get(id);
      if (!icon) {
        throw new Error(`OxIconElement: icon "${id}" was not found in the registry after loading.`);
      }

      const svg = renderer.render(icon, this.readRenderOptions());
      this.clear();
      this.shadowRoot?.appendChild(svg);
    } catch (error) {
      this.reportError(error);
    }
  }

  /**
   * Single error path for every failure mode, see ADR-0013: never
   * throws, always reports and renders nothing.
   */
  private reportError(error: unknown): void {
    console.error(error);
    this.dispatchEvent(new CustomEvent('oxide-icon-error', { detail: error, bubbles: true }));
    this.clear();
  }

  /**
   * Context resolution per ADR-0012: own attributes checked first
   * (`inherited: false`), then ancestors (`inherited: true`), then
   * `null`. Only ever walks `parentElement`, never re-checks a
   * subtree, and never re-runs on ancestor attribute changes, a
   * documented v1 limitation, see ADR-0011.
   */
  private resolveContext(): IconContext | null {
    const ownFamily = this.getAttribute('data-icon-family');
    if (ownFamily) {
      return { family: ownFamily, mode: this.readIsolationMode(this), inherited: false };
    }

    let ancestor = this.parentElement;
    while (ancestor) {
      const found = ancestor.getAttribute('data-icon-family');
      if (found) {
        return { family: found, mode: this.readIsolationMode(ancestor), inherited: true };
      }
      ancestor = ancestor.parentElement;
    }

    return null;
  }

  private readIsolationMode(element: Element): IsolationMode {
    const raw = element.getAttribute('data-icon-isolation') ?? 'soft';
    if (raw !== 'soft' && raw !== 'exclusive' && raw !== 'strict') {
      throw new Error(
        `OxIconElement: invalid data-icon-isolation value "${raw}", expected "soft", "exclusive", or "strict".`
      );
    }
    return raw;
  }

  private readRenderOptions(): RenderOptions {
    return {
      size: Number(this.getAttribute('size') ?? '24'),
      color: this.getAttribute('color') ?? 'currentColor',
      strokeWidth: Number(this.getAttribute('stroke-width') ?? '2'),
    };
  }

  private clear(): void {
    this.shadowRoot?.replaceChildren();
  }
}
