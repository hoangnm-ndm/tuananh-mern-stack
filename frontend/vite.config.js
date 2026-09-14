import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    /**
     * Bi danh duong dan: `@/core/...` thay vi `../../../core/...`.
     * Giup di chuyen file ma khong phai sua hang loat import.
     */
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },

  server: {
    port: 5173,
    /**
     * Proxy /api sang backend khi dev -> trinh duyet coi nhu CUNG origin.
     * Nho vay cookie httpOnly (refresh token) duoc gui binh thuong, khong vuong CORS.
     */
    proxy: {
      "/api": {
        target: process.env.VITE_PROXY_TARGET || "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
    include: ["src/**/*.test.{js,jsx}"],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/main.jsx", "src/test/**", "src/**/index.js"],
    },
  },
});
