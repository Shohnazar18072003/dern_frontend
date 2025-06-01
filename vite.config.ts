import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dotenv from "dotenv";

// https://vite.dev/config/
dotenv.config();

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/dern-frontend/",
  build: {
    chunkSizeWarningLimit: 1500,
    outDir: "build", // This is the default; ensure it’s not set to something else
    rollupOptions: {
      output: {
        // manualChunks: {
        //   // Define your manual chunks here
        // },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: Number(process.env.VITE_PORT) || 5173,
    proxy: {
      "/api": {
        target:
          process.env.VITE_API_PROXY_TARGET ||
          "https://dern-backend-plc9.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
