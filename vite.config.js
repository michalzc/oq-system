import { defineConfig } from 'vite';
import { systemMeta } from './tools/vite-plugin-system-meta.mjs';
import { systemStyles } from './tools/vite-plugin-system-styles.mjs';

export default defineConfig({
  publicDir: 'src/public',
  plugins: [systemMeta(), systemStyles()],
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
    },
    rolldownOptions: {
      output: {
        chunkFileNames: 'module/[name]-[hash].js',
        // Foundry persists sheet identifiers derived from class names.
        keepNames: true,
      },
    },
  },
});
