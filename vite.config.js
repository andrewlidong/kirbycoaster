import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/kirbycoaster/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          'three': ['three']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['three']
  },
  resolve: {
    alias: {
      'three': 'three'
    }
  },
  server: {
    hmr: {
      timeout: 5000
    }
  }
});