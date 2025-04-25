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
          'three': ['three'],
          'p5': ['p5']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['three', 'p5']
  },
  resolve: {
    alias: {
      'three': 'three',
      'p5': 'p5'
    }
  },
  server: {
    hmr: {
      timeout: 5000
    }
  }
});