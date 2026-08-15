/**
 * Recognized icon source file extensions, see ADR-0015.
 */
export const ICON_SOURCE_EXTENSIONS = new Set(['.ts', '.js']);

/**
 * Given a bare file name (no directory), returns the icon name (the
 * name with a recognized icon source extension removed), or `null` if
 * the file does not have one of those extensions.
 *
 * Pure string manipulation, no `fs`, no `import.meta`, shared between
 * `FsManifestBuilder` (Node, build-time) and `createIconSource`
 * (browser, via `import.meta.glob`), see ADR-0015.
 */
export function iconNameFromFileName(fileName: string): string | null {
  const dot = fileName.lastIndexOf('.');
  if (dot <= 0) {
    return null;
  }

  const ext = fileName.slice(dot).toLowerCase();
  if (!ICON_SOURCE_EXTENSIONS.has(ext)) {
    return null;
  }

  return fileName.slice(0, dot);
}
