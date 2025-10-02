import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

const rootDir = resolve(__dirname, 'src');

export default defineConfig(({ mode }) => {
  const isLibraryBuild = mode === 'lib';
  
  return {
    base: isLibraryBuild ? undefined : '/rumora/',
    build: isLibraryBuild ? {
      lib: {
        entry: resolve(rootDir, 'index.ts'),
      },
      rollupOptions: {
        external: [
          // Excluir test utilities
          /^@\/test\//,
          /.*\.test\.ts$/,
          /.*\.spec\.ts$/
        ],
        output: [
          {
            format: 'es',
            dir: 'dist',
            preserveModules: true,
            preserveModulesRoot: 'src',
            exports: 'named',
            entryFileNames: '[name].js'
          },
          {
            format: 'cjs', 
            dir: 'dist',
            preserveModules: true,
            preserveModulesRoot: 'src',
            exports: 'named',
            entryFileNames: '[name].cjs'
          }
        ]
      },
      sourcemap: true,
      emptyOutDir: true,
    } : {
      // Demo build para GitHub Pages
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: resolve(__dirname, 'index.html')
      }
    },
    
    plugins: isLibraryBuild ? [
      dts({
        insertTypesEntry: true,
        outDir: 'dist',
        exclude: ['src/test/**/*', '**/*.test.ts', '**/*.spec.ts']
      })
    ] : [],
    
    resolve: {
      alias: {
        '@': rootDir
      }
    }
  };
});