import { defineConfig } from 'vite';
import { systemMeta } from './tools/vite-plugin-system-meta.mjs';

export default defineConfig({
  publicDir: 'src/public',
  plugins: [systemMeta()],
  build: {
    outDir: 'build/',
    emptyOutDir: false,
    minify: true,
    sourcemap: true,
    lib: {
      name: 'oq-system',
      entry: 'src/module/oq.js',
      formats: ['es'],
      fileName: () => 'module/oq.js',
      cssFileName: 'styles/oq',
    },
    rolldownOptions: {
      // Foundry serves these URLs at runtime; preserve them in the generated CSS.
      external: [/^\/systems\/oq\//, /^\/ui\//, /^\.\.\/assets\//],
      output: {
        chunkFileNames: 'module/[name]-[hash].js',
        // Foundry persists sheet identifiers derived from class names.
        keepNames: true,
      },
    },
  },
});
