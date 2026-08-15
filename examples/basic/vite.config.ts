import { defineConfig } from 'vite';

export default defineConfig({
  root: __dirname,
  build: {
    outDir: '../../dist/examples/basic',
    emptyOutDir: true,
  },
});
