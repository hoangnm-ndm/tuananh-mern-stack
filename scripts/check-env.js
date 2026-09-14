#!/usr/bin/env node
/**
 * So sanh .env voi .env.example cua tung workspace.
 * Muc dich: dam bao 2 file LUON dong nhat ve tap key (yeu cau #5).
 * Exit code 1 neu lech -> dung duoc trong CI / pre-commit.
 */
import { WORKSPACES, parseEnvKeys, envPaths } from "./env-utils.js";

let failed = false;

for (const ws of WORKSPACES) {
  const { env, example } = envPaths(ws);
  const exampleKeys = parseEnvKeys(example);
  const envKeys = parseEnvKeys(env);

  if (!exampleKeys) {
    console.error(`[${ws}] ✗ Thieu .env.example`);
    failed = true;
    continue;
  }
  if (!envKeys) {
    console.warn(`[${ws}] ⚠ Chua co .env — chay: npm run env:sync`);
    continue;
  }

  const missing = [...exampleKeys.keys()].filter((k) => !envKeys.has(k));
  const extra = [...envKeys.keys()].filter((k) => !exampleKeys.has(k));

  if (missing.length) {
    console.error(`[${ws}] ✗ .env THIEU key: ${missing.join(", ")}`);
    failed = true;
  }
  if (extra.length) {
    console.error(
      `[${ws}] ✗ .env co key THUA (chua khai bao trong .env.example): ${extra.join(", ")}`,
    );
    failed = true;
  }
  if (!missing.length && !extra.length) {
    console.info(`[${ws}] ✓ .env dong bo voi .env.example (${exampleKeys.size} key)`);
  }
}

process.exit(failed ? 1 : 0);
