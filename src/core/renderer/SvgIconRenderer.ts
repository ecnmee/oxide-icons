import type { IconData, RenderOptions, Renderer } from '../domain';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

/**
 * Only implementation of {@link Renderer} in v2, see ADR-0006 for the
 * naming convention (strategy-prefixed, `Renderer` is a swappable
 * contract, unlike `IconRegistry`).
 *
 * Convention, not previously written down elsewhere, fixed here:
 * icons are outline-style, stroke-based, matching the audited previous
 * project ("24x24px, 2px stroke, round caps/joins"). `icon.body` is
 * expected to contain path/line/shape markup with no hardcoded
 * `stroke`/`fill` of its own, so it inherits `stroke`, `fill`,
 * `stroke-width`, `stroke-linecap`, and `stroke-linejoin` from the
 * root `<svg>` element this renderer sets, standard SVG presentation
 * attribute inheritance, no per-shape styling needed. A filled-icon
 * style is not supported, no consumer needs it yet, see
 * `notes/en/future-ideas.md` if that changes.
 *
 * Trusts `icon.body` is already safe markup. Does not sanitize.
 * Sanitizing untrusted SVG (e.g. AI-generated or user-imported) is the
 * responsibility of whatever produces `IconData` in the first place,
 * see `notes/en/product/ai-icon-authoring.md`, never this renderer.
 */
export class SvgIconRenderer implements Renderer {
  render(icon: IconData, options: RenderOptions): SVGElement {
    const svg = document.createElementNS(SVG_NAMESPACE, 'svg');

    svg.setAttribute('viewBox', icon.viewBox);
    svg.setAttribute('width', String(options.size));
    svg.setAttribute('height', String(options.size));
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', options.color);
    svg.setAttribute('stroke-width', String(options.strokeWidth));
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');

    svg.innerHTML = icon.body;

    return svg;
  }
}
