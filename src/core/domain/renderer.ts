import type { IconData } from './icon';

/** Presentation options applied by a {@link Renderer}. */
export interface RenderOptions {
  size: number;
  color: string;
  strokeWidth: number;
}

/**
 * Turns an {@link IconData} plus presentation options into an SVG node.
 *
 * Does not decide which icon to render, does not know about the DOM
 * beyond the `SVGElement` it returns (see ADR-0002, principle 11).
 */
export interface Renderer {
  render(icon: IconData, options: RenderOptions): SVGElement;
}
