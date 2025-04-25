import { defineConfig } from 'vite';

export default defineConfig({
  base: './',  // Changed from '/roller_coaster/' to './' for better path resolution
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  resolve: {
    alias: {
      'three': 'three'
    }
  },
  server: {
    open: true
  }
});