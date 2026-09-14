#!/usr/bin/env node
/**
 * Tao .env tu .env.example (neu chua co), hoac chi BO SUNG cac key con thieu.
 * Khong bao gio ghi de gia tri dang co -> an toan khi chay lai nhieu lan.
 */
import fs from "node:fs";
import { WORKSPACES, parseEnvKeys, envPaths } from "./env-utils.js";

for (const ws of WORKSPACES) {
  const { env, example } = envPaths(ws);
  if (!fs.existsSync(example)) {
    console.warn(`[${ws}] ⚠ Bo qua: khong tim thay .env.example`);
    continue;
  }

  if (!fs.existsSync(env)) {
    fs.copyFileSync(example, env);
    console.info(`[${ws}] ✓ Da tao .env tu .env.example — hay dien cac gia tri REQUIRED.`);
    continue;
  }

  const exampleKeys = parseEnvKeys(example);
  const envKeys = parseEnvKeys(env);
  const missing = [...exampleKeys.entries()].filter(([k]) => !envKeys.has(k));

  if (!missing.length) {
    console.info(`[${ws}] ✓ .env da day du key.`);
    continue;
  }

  const block =
    `\n# ---- Tu dong bo sung boi "npm run env:sync" (${new Date().toISOString()}) ----\n` +
    missing.map(([k, v]) => `${k}=${v}`).join("\n") +
    "\n";
  fs.appendFileSync(env, block);
  console.info(`[${ws}] ✓ Da bo sung ${missing.length} key: ${missing.map(([k]) => k).join(", ")}`);
}
