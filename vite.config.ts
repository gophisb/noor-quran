import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  // GitHub Pages project site: https://gophisb.github.io/noor-quran/
  base: "/noor-quran/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    // Keep JS/CSS as separate cached assets instead of embedding the whole
    // application (and the large embedded adhan audio) into index.html.
    assetsInlineLimit: 4096,
    sourcemap: false,
  },
});
