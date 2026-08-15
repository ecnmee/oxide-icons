/**
 * Public API of `oxide-icons/vite`. See ADR-0016.
 *
 * Kept separate from the main `oxide-icons` entry point so a consumer
 * who never imports this subpath never pulls in anything Vite-shaped
 * (`peerDependencies.vite` is optional, see `package.json`).
 */

export { createIconSource } from './createIconSource';
export type { IconSource, IconGlobModules } from './createIconSource';
