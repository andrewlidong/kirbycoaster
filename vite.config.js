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
      }
    }
  },
  optimizeDeps: {
    force: true,
    entries: [
      'js/main.js'
    ]
  },
  resolve: {
    alias: {
      'three': resolve(__dirname, 'node_modules/three/build/three.module.js')
    }
  },
  server: {
    hmr: {
      timeout: 5000
    }
  }
});