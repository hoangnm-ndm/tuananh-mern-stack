import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.js"],
    setupFiles: ["tests/setup.js"],
    /**
     * Chay tuan tu trong MOT tien trinh: cac test tich hop dung chung
     * mot MongoDB in-memory va mot ket noi mongoose duy nhat.
     */
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
    testTimeout: 30_000,
    hookTimeout: 60_000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.js"],
      exclude: ["src/index.js", "src/seeds/**", "src/**/index.js"],
    },
  },
});
