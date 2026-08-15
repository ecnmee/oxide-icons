import { OxIconElement } from '../../src/web-component/OxIconElement';
import { Registry } from '../../src/core/registry/Registry';
import { MemoryIconCatalog } from '../../src/core/catalog/MemoryIconCatalog';
import { IsolationPolicy } from '../../src/core/context/IsolationPolicy';
import { SvgIconRenderer } from '../../src/core/renderer/SvgIconRenderer';
import { createIconSource, type IconGlobModules } from '../../src/vite-plugin/createIconSource';

// The one place in this whole project where import.meta.glob's literal
// call is written, see ADR-0014: createIconSource only transforms an
// already-called result, it never calls import.meta.glob itself.
const glob = import.meta.glob('../../src/icons/*/*.ts') as IconGlobModules;
const { manifest, loader } = createIconSource(glob);

const catalog = new MemoryIconCatalog();
const registry = new Registry(manifest, catalog);

// One DynamicImportIconLoader instance serves every family, see ADR-0014.
for (const family of new Set(manifest.values())) {
  registry.registerLoader(family, loader);
}

OxIconElement.manifest = manifest;
OxIconElement.registry = registry;
OxIconElement.renderer = new SvgIconRenderer();
OxIconElement.isolationPolicy = new IsolationPolicy();

if (!customElements.get('ox-icon')) {
  customElements.define('ox-icon', OxIconElement);
}

// Visible proof the failure path works too, not just the happy path:
// logs to the console and shows a small on-page counter, see ADR-0013.
let errorCount = 0;
document.addEventListener('oxide-icon-error', (event) => {
  errorCount += 1;
  const el = document.querySelector('#error-count');
  if (el) {
    el.textContent = String(errorCount);
  }
  console.error('oxide-icon-error:', (event as CustomEvent).detail);
});

// Full catalog, built from `manifest`, not hand-listed: every icon
// that actually exists under src/icons/ shows up here automatically,
// grouped by family, sorted, no icon can silently go missing from
// this page just because nobody remembered to add it by hand.
const catalogRoot = document.querySelector('#catalog');
if (catalogRoot) {
  const byFamily = new Map<string, string[]>();
  for (const [iconId, family] of manifest) {
    const name = iconId.slice(family.length + 1);
    const names = byFamily.get(family) ?? [];
    names.push(name);
    byFamily.set(family, names);
  }

  const countEl = document.querySelector('#catalog-count');
  if (countEl) {
    countEl.textContent = `${manifest.size} icons, ${byFamily.size} families`;
  }

  for (const family of [...byFamily.keys()].sort()) {
    const names = byFamily.get(family)!.sort();

    const section = document.createElement('section');
    section.dataset.iconFamily = family;

    const heading = document.createElement('h2');
    heading.textContent = `${family} (${names.length})`;
    section.appendChild(heading);

    const row = document.createElement('div');
    row.className = 'row';

    for (const name of names) {
      const figure = document.createElement('figure');
      figure.dataset.iconName = `${family}:${name}`;

      const icon = document.createElement('ox-icon');
      icon.setAttribute('name', name);
      figure.appendChild(icon);

      const caption = document.createElement('figcaption');
      caption.textContent = name;
      figure.appendChild(caption);

      row.appendChild(figure);
    }

    section.appendChild(row);
    catalogRoot.appendChild(section);
  }
}

// Live filter: matches against "family:name", so both "cloud" and
// "weather:cloud" narrow the same way. Pure substring, no fuzzy
// matching, nothing to explain.
const filterInput = document.querySelector<HTMLInputElement>('#catalog-filter');
if (filterInput && catalogRoot) {
  filterInput.addEventListener('input', () => {
    const query = filterInput.value.trim().toLowerCase();
    const figures = catalogRoot.querySelectorAll<HTMLElement>('figure[data-icon-name]');
    for (const figure of figures) {
      const match = (figure.dataset.iconName ?? '').toLowerCase().includes(query);
      figure.style.display = match ? '' : 'none';
    }
    const sections = catalogRoot.querySelectorAll<HTMLElement>('section[data-icon-family]');
    for (const section of sections) {
      const visible = section.querySelector('figure:not([style*="display: none"])');
      section.style.display = visible ? '' : 'none';
    }
  });
}
