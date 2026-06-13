import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2020'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@renderers': path.resolve(__dirname, './src/renderers'),
      '@events': path.resolve(__dirname, './src/events')
    }
  },
  optimizeDeps: {
    include: ['pixi.js-legacy', 'canvaskit-wasm']
  }
});