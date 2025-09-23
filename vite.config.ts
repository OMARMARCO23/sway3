import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["tesseract.js"]
  },
  build: {
    rollupOptions: {
      external: [], // you can add "tesseract.js" here if bundling still breaks
    }
  }
});
