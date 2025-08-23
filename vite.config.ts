import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

const rootDir = resolve(__dirname, 'src')

export default defineConfig({
  build: {
    lib: {
      entry: resolve(rootDir, 'main.ts'),
      name: 'Rumora',
      formats: ['es', 'cjs'],
      fileName: (format) => `rumora.${format}.js`
    },
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: true,
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
})
