// @vitest-environment jsdom
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * Same polling wait as basicExample.test.ts: real dynamic import()
 * through Vite's module graph needs more than a single tick.
 */
async function waitFor(predicate: () => boolean, timeoutMs = 3000): Promise<void> {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(`waitFor: condition not met within ${timeoutMs}ms`);
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

describe('examples/basic, the dynamic full-catalog section', () => {
  beforeAll(async () => {
    // The #catalog/#catalog-count/#catalog-filter elements have to
    // exist BEFORE main.ts is first imported: its catalog-building
    // code runs once, at module-evaluation time, same as the real
    // page loading main.ts after its own markup.
    document.body.innerHTML = `
      <span id="catalog-count"></span>
      <input id="catalog-filter" />
      <div id="catalog"></div>
    `;

    await import('../../examples/basic/main');

    await waitFor(() => document.querySelectorAll('#catalog section').length > 0);
  });

  it('builds one section per real family, from the manifest, not a hand-written list', () => {
    const sections = document.querySelectorAll('#catalog section[data-icon-family]');
    const families = [...sections].map((s) => (s as HTMLElement).dataset.iconFamily).sort();

    expect(families).toEqual(
      [
        'actions',
        'arrows',
        'commerce',
        'communication',
        'devices',
        'files-folders',
        'media',
        'navigation',
        'security',
        'ui',
        'weather',
      ].sort()
    );
  });

  it('renders every one of the 104 real icons as an <ox-icon>, matching the manifest count', () => {
    const figures = document.querySelectorAll('#catalog figure[data-icon-name]');
    expect(figures).toHaveLength(104);

    for (const figure of figures) {
      expect((figure as HTMLElement).querySelector('ox-icon')).not.toBeNull();
    }
  });

  it('shows the total count', () => {
    expect(document.querySelector('#catalog-count')?.textContent).toBe(
      '104 icons, 11 families'
    );
  });

  it('every catalog icon actually renders an svg, none silently empty', async () => {
    await waitFor(() => {
      const icons = document.querySelectorAll('#catalog ox-icon');
      return (
        icons.length === 104 &&
        [...icons].every((el) => (el as HTMLElement).shadowRoot?.querySelector('svg') != null)
      );
    }, 5000);

    const icons = document.querySelectorAll('#catalog ox-icon');
    const withoutSvg = [...icons].filter(
      (el) => (el as HTMLElement).shadowRoot?.querySelector('svg') == null
    );

    expect(withoutSvg).toHaveLength(0);
  });

  it('the live filter narrows to matching icons and hides empty families', () => {
    const filterInput = document.querySelector<HTMLInputElement>('#catalog-filter')!;

    filterInput.value = 'cloud';
    filterInput.dispatchEvent(new Event('input'));

    const visibleFigures = [...document.querySelectorAll<HTMLElement>('#catalog figure')].filter(
      (f) => f.style.display !== 'none'
    );
    expect(visibleFigures.map((f) => f.dataset.iconName).sort()).toEqual(
      ['weather:cloud', 'weather:cloud-lightning', 'weather:cloud-rain', 'weather:cloud-snow'].sort()
    );

    const visibleSections = [...document.querySelectorAll<HTMLElement>('#catalog section')].filter(
      (s) => s.style.display !== 'none'
    );
    expect(visibleSections).toHaveLength(1);
    expect(visibleSections[0].dataset.iconFamily).toBe('weather');

    // Reset, so this test doesn't leak filtered state into whichever
    // test happens to run after it in the same file.
    filterInput.value = '';
    filterInput.dispatchEvent(new Event('input'));
  });
});
