import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
optimizeDeps: {
  include: ["tesseract.js"]
}
// Vercel Rollup build fix for Tesseract.js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Optional: Proxy to deployed backend during local dev
      "/api": {
        target: "https://sway3.vercel.app", // replace with your deployed URL
        changeOrigin: true,
      },
    },
  },
    build: {
    rollupOptions: {
      external: ["tesseract.js"], // 👈 prevent bundling Tesseract
    },
  },
});
