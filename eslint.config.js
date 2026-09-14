import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-config-prettier";

/**
 * Vitest chay voi `globals: true` -> describe/it/expect/vi... la bien toan cuc.
 * Khai bao o day de ESLint khong bao "is not defined".
 */
const VITEST_GLOBALS = {
  describe: "readonly",
  it: "readonly",
  test: "readonly",
  expect: "readonly",
  vi: "readonly",
  beforeAll: "readonly",
  beforeEach: "readonly",
  afterAll: "readonly",
  afterEach: "readonly",
  suite: "readonly",
};

/**
 * ESLint flat config dung chung cho ca monorepo.
 * - backend/: Node (ESM), khong co DOM.
 * - frontend/: Browser + React.
 */
export default [
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/coverage/**", "**/*.min.js"],
  },

  js.configs.recommended,

  // ---------- Backend (Node ESM) ----------
  {
    files: ["backend/**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.node, ...globals.es2023 },
    },
    rules: {
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      eqeqeq: ["error", "smart"],
      "prefer-const": "error",
    },
  },

  // ---------- Backend tests ----------
  {
    files: ["backend/**/*.test.js", "backend/tests/**/*.js"],
    languageOptions: { globals: { ...globals.node, ...VITEST_GLOBALS } },
    rules: { "no-console": "off" },
  },

  // ---------- Frontend (React) ----------
  {
    files: ["frontend/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.es2023 },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]", argsIgnorePattern: "^_" }],
    },
  },

  // ---------- Frontend tests ----------
  {
    files: ["frontend/**/*.test.{js,jsx}", "frontend/src/test/**/*.{js,jsx}"],
    languageOptions: { globals: { ...globals.browser, ...globals.node, ...VITEST_GLOBALS } },
    rules: { "react-refresh/only-export-components": "off" },
  },

  // ---------- Script va file cau hinh (chay bang Node) ----------
  {
    files: ["scripts/**/*.js", "**/*.config.js"],
    languageOptions: { globals: { ...globals.node } },
    rules: { "no-console": "off" },
  },

  prettier,
];
