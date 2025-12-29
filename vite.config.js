import { defineConfig } from "vite";
import includeHtml from "vite-plugin-include-html";
import path from "node:path";

export default defineConfig({
  base: "./",
  plugins: [includeHtml()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
