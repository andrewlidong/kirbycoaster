import { defineConfig } from 'vite';

export default defineConfig({
  base: '/roller_coaster/', // Replace with your repository name
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      external: ['three'],
    }
  },
  resolve: {
    alias: {
      'three': '/node_modules/three/build/three.module.js'
    }
  },
  server: {
    open: true
  }
});