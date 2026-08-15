// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { SvgIconRenderer } from '../../../src/core/renderer/SvgIconRenderer';
import { toIconId, type IconData } from '../../../src/core/domain';

function icon(overrides: Partial<IconData> = {}): IconData {
  return {
    id: toIconId('ui', 'add'),
    family: 'ui',
    name: 'add',
    viewBox: '0 0 24 24',
    body: '<line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />',
    ...overrides,
  };
}

describe('SvgIconRenderer', () => {
  it('creates a real SVGElement in the SVG namespace', () => {
    const renderer = new SvgIconRenderer();

    const svg = renderer.render(icon(), { size: 24, color: 'currentColor', strokeWidth: 2 });

    expect(svg).toBeInstanceOf(SVGElement);
    expect(svg.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(svg.tagName.toLowerCase()).toBe('svg');
  });

  it('sets viewBox from the icon and size from the options', () => {
    const renderer = new SvgIconRenderer();

    const svg = renderer.render(icon({ viewBox: '0 0 32 32' }), {
      size: 48,
      color: 'currentColor',
      strokeWidth: 2,
    });

    expect(svg.getAttribute('viewBox')).toBe('0 0 32 32');
    expect(svg.getAttribute('width')).toBe('48');
    expect(svg.getAttribute('height')).toBe('48');
  });

  it('sets stroke color and stroke-width from options, fill none, round caps and joins', () => {
    const renderer = new SvgIconRenderer();

    const svg = renderer.render(icon(), { size: 24, color: '#ff0000', strokeWidth: 1.5 });

    expect(svg.getAttribute('fill')).toBe('none');
    expect(svg.getAttribute('stroke')).toBe('#ff0000');
    expect(svg.getAttribute('stroke-width')).toBe('1.5');
    expect(svg.getAttribute('stroke-linecap')).toBe('round');
    expect(svg.getAttribute('stroke-linejoin')).toBe('round');
  });

  it('places icon.body as the actual inner content, queryable as real elements', () => {
    const renderer = new SvgIconRenderer();

    const svg = renderer.render(icon(), { size: 24, color: 'currentColor', strokeWidth: 2 });

    const lines = svg.querySelectorAll('line');
    expect(lines).toHaveLength(2);
    expect(lines[0]?.getAttribute('x1')).toBe('12');
  });

  it('inner shapes have no stroke or fill of their own, so they inherit from the root svg', () => {
    const renderer = new SvgIconRenderer();

    const svg = renderer.render(icon(), { size: 24, color: 'currentColor', strokeWidth: 2 });

    const line = svg.querySelector('line');
    expect(line?.hasAttribute('stroke')).toBe(false);
    expect(line?.hasAttribute('fill')).toBe(false);
  });

  it('renders two different icons independently, no shared state between calls', () => {
    const renderer = new SvgIconRenderer();

    const first = renderer.render(icon({ viewBox: '0 0 24 24' }), {
      size: 16,
      color: 'red',
      strokeWidth: 1,
    });
    const second = renderer.render(icon({ viewBox: '0 0 32 32' }), {
      size: 32,
      color: 'blue',
      strokeWidth: 3,
    });

    expect(first.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(second.getAttribute('viewBox')).toBe('0 0 32 32');
    expect(first.getAttribute('stroke')).toBe('red');
    expect(second.getAttribute('stroke')).toBe('blue');
  });
});
