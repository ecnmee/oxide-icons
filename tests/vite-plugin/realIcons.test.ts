import { describe, expect, it } from 'vitest';
import { createIconSource, type IconGlobModules } from '../../src/vite-plugin/createIconSource';
import { SvgIconRenderer } from '../../src/core/renderer/SvgIconRenderer';
import { toIconId } from '../../src/core/domain';

// The real, committed icon set, not fixtures, closing the loop:
// real files -> real glob -> real manifest -> real load -> real render.
const glob = import.meta.glob('../../src/icons/*/*.ts') as IconGlobModules;

describe('the real committed icon set', () => {
  it('has exactly the expected 104 icons across ui, arrows, actions, navigation, files-folders, communication, media, devices, commerce, security, and weather', () => {
    const { manifest } = createIconSource(glob);

    expect(manifest.size).toBe(104);
    expect([...manifest.values()].filter((f) => f === 'ui')).toHaveLength(10);
    expect([...manifest.values()].filter((f) => f === 'arrows')).toHaveLength(4);
    expect([...manifest.values()].filter((f) => f === 'actions')).toHaveLength(10);
    expect([...manifest.values()].filter((f) => f === 'navigation')).toHaveLength(10);
    expect([...manifest.values()].filter((f) => f === 'files-folders')).toHaveLength(10);
    expect([...manifest.values()].filter((f) => f === 'communication')).toHaveLength(10);
    expect([...manifest.values()].filter((f) => f === 'media')).toHaveLength(10);
    expect([...manifest.values()].filter((f) => f === 'devices')).toHaveLength(10);
    expect([...manifest.values()].filter((f) => f === 'commerce')).toHaveLength(10);
    expect([...manifest.values()].filter((f) => f === 'security')).toHaveLength(10);
    expect([...manifest.values()].filter((f) => f === 'weather')).toHaveLength(10);
  });

  it('loads the ui family and every icon has a non-empty body and viewBox', async () => {
    const { loader } = createIconSource(glob);

    const icons = await loader.load('ui');

    expect(icons).toHaveLength(10);
    for (const icon of icons) {
      expect(icon.viewBox).toBe('0 0 24 24');
      expect(icon.body.length).toBeGreaterThan(0);
    }
  });

  it('loads the actions family and every icon has a non-empty body and viewBox', async () => {
    const { loader } = createIconSource(glob);

    const icons = await loader.load('actions');

    expect(icons).toHaveLength(10);
    for (const icon of icons) {
      expect(icon.viewBox).toBe('0 0 24 24');
      expect(icon.body.length).toBeGreaterThan(0);
    }
  });

  it('loads the navigation family and every icon has a non-empty body and viewBox', async () => {
    const { loader } = createIconSource(glob);

    const icons = await loader.load('navigation');

    expect(icons).toHaveLength(10);
    for (const icon of icons) {
      expect(icon.viewBox).toBe('0 0 24 24');
      expect(icon.body.length).toBeGreaterThan(0);
    }
  });

  it('loads the files-folders family and every icon has a non-empty body and viewBox', async () => {
    const { loader } = createIconSource(glob);

    const icons = await loader.load('files-folders');

    expect(icons).toHaveLength(10);
    for (const icon of icons) {
      expect(icon.viewBox).toBe('0 0 24 24');
      expect(icon.body.length).toBeGreaterThan(0);
    }
  });

  it('loads the communication family and every icon has a non-empty body and viewBox', async () => {
    const { loader } = createIconSource(glob);

    const icons = await loader.load('communication');

    expect(icons).toHaveLength(10);
    for (const icon of icons) {
      expect(icon.viewBox).toBe('0 0 24 24');
      expect(icon.body.length).toBeGreaterThan(0);
    }
  });

  it('loads the media family and every icon has a non-empty body and viewBox', async () => {
    const { loader } = createIconSource(glob);

    const icons = await loader.load('media');

    expect(icons).toHaveLength(10);
    for (const icon of icons) {
      expect(icon.viewBox).toBe('0 0 24 24');
      expect(icon.body.length).toBeGreaterThan(0);
    }
  });

  it('loads the devices family and every icon has a non-empty body and viewBox', async () => {
    const { loader } = createIconSource(glob);

    const icons = await loader.load('devices');

    expect(icons).toHaveLength(10);
    for (const icon of icons) {
      expect(icon.viewBox).toBe('0 0 24 24');
      expect(icon.body.length).toBeGreaterThan(0);
    }
  });

  it('loads the commerce family and every icon has a non-empty body and viewBox', async () => {
    const { loader } = createIconSource(glob);

    const icons = await loader.load('commerce');

    expect(icons).toHaveLength(10);
    for (const icon of icons) {
      expect(icon.viewBox).toBe('0 0 24 24');
      expect(icon.body.length).toBeGreaterThan(0);
    }
  });

  it('loads the security family and every icon has a non-empty body and viewBox', async () => {
    const { loader } = createIconSource(glob);

    const icons = await loader.load('security');

    expect(icons).toHaveLength(10);
    for (const icon of icons) {
      expect(icon.viewBox).toBe('0 0 24 24');
      expect(icon.body.length).toBeGreaterThan(0);
    }
  });

  it('loads the weather family and every icon has a non-empty body and viewBox', async () => {
    const { loader } = createIconSource(glob);

    const icons = await loader.load('weather');

    expect(icons).toHaveLength(10);
    for (const icon of icons) {
      expect(icon.viewBox).toBe('0 0 24 24');
      expect(icon.body.length).toBeGreaterThan(0);
    }
  });

  it('every real icon renders to a real SVGElement with content', async () => {
    // @vitest-environment-note: uses global document, this file runs
    // in whatever environment vitest.config.ts sets by default (node),
    // so this test only checks structural data, not a real DOM render,
    // see OxIconElement/SvgIconRenderer tests for jsdom-based rendering.
    const { manifest, loader } = createIconSource(glob);
    const uiIcons = await loader.load('ui');
    const arrowIcons = await loader.load('arrows');
    const actionIcons = await loader.load('actions');
    const navIcons = await loader.load('navigation');
    const fileIcons = await loader.load('files-folders');
    const commIcons = await loader.load('communication');
    const mediaIcons = await loader.load('media');
    const deviceIcons = await loader.load('devices');
    const commerceIcons = await loader.load('commerce');
    const securityIcons = await loader.load('security');
    const weatherIcons = await loader.load('weather');
    const all = [...uiIcons, ...arrowIcons, ...actionIcons, ...navIcons, ...fileIcons, ...commIcons, ...mediaIcons, ...deviceIcons, ...commerceIcons, ...securityIcons, ...weatherIcons];

    expect(all).toHaveLength(manifest.size);
    expect(all.map((i) => i.id).sort()).toEqual(
      [...manifest.keys()].sort()
    );
  });

  it('the edit icon uses no SVG arc commands (line-only construction, see src/icons/README.md)', async () => {
    const { loader } = createIconSource(glob);
    const icons = await loader.load('ui');
    const edit = icons.find((i) => i.name === 'edit');

    expect(edit).toBeDefined();
    // Arc commands only ever appear inside a path's d="..." attribute,
    // as an "A" or "a" letter followed by the arc parameters.
    expect(edit?.body).not.toMatch(/d="[^"]*[Aa][0-9]/);
  });
});
