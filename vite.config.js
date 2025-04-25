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
      external: ['https://unpkg.com/three@0.162.0/build/three.module.js', 'https://unpkg.com/p5@1.11.5/lib/p5.min.js']
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