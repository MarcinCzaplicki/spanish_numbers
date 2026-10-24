import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" -> działa pod dowolną nazwą repozytorium na GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: "./",
});
