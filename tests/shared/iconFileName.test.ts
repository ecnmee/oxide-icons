import { describe, expect, it } from 'vitest';
import { iconNameFromFileName, ICON_SOURCE_EXTENSIONS } from '../../src/shared/iconFileName';

describe('iconNameFromFileName', () => {
  it('strips a .ts extension', () => {
    expect(iconNameFromFileName('add.ts')).toBe('add');
  });

  it('strips a .js extension', () => {
    expect(iconNameFromFileName('add.js')).toBe('add');
  });

  it('is case-insensitive on the extension', () => {
    expect(iconNameFromFileName('ADD.TS')).toBe('ADD');
  });

  it('returns null for an unrecognized extension', () => {
    expect(iconNameFromFileName('README.md')).toBeNull();
  });

  it('returns null for a file with no extension', () => {
    expect(iconNameFromFileName('add')).toBeNull();
  });

  it('returns null for a dotfile with no real extension', () => {
    expect(iconNameFromFileName('.DS_Store')).toBeNull();
  });

  it('exposes the recognized extension set', () => {
    expect(ICON_SOURCE_EXTENSIONS.has('.ts')).toBe(true);
    expect(ICON_SOURCE_EXTENSIONS.has('.js')).toBe(true);
    expect(ICON_SOURCE_EXTENSIONS.has('.md')).toBe(false);
  });
});
