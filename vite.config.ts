import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    minify: "esbuild",
    target: "es2020",
  },

  optimizeDeps: {
    include: ["pixi.js-legacy", "canvaskit-wasm"],
  },
});
