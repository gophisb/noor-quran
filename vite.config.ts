import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GitHub Pages needs the repository prefix; Capacitor local WebView does not.
const isCapacitorBuild = process.env.CAPACITOR_BUILD === "true";

export default defineConfig({
  base: isCapacitorBuild ? "./" : "/noor-quran/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    assetsInlineLimit: 4096,
    sourcemap: false,
  },
});
