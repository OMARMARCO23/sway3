import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Replace this with your Vercel deployment URL
const VERCEL_BACKEND = "https://sway3.vercel.app";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: VERCEL_BACKEND,
        changeOrigin: true,
      },
    },
  },
});
