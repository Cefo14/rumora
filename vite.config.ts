import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

const rootDir = resolve(__dirname, 'src');

export default defineConfig({
  build: {
    lib: {
      entry: resolve(rootDir, 'index.ts'),
      name: 'Rumora',
      formats: ['es', 'cjs'],
      fileName: (format) => `rumora.${format}.js`
    },
    rollupOptions: {
      external: ['@/test-utils'],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        exports: 'named'
      }
    },
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: false,
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      outDir: 'dist'
    })
  ],
  resolve: {
    alias: {
      '@': rootDir
    }
  }
});
