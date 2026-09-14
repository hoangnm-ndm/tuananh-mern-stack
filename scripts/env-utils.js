import fs from "node:fs";
import path from "node:path";

export const WORKSPACES = ["backend", "frontend"];

/** Doc file .env dang key=value -> Map<key, rawLine>. Bo qua comment + dong trong. */
export function parseEnvKeys(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const keys = new Map();
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed
      .slice(0, eq)
      .trim()
      .replace(/^export\s+/, "");
    if (key) keys.set(key, trimmed.slice(eq + 1).trim());
  }
  return keys;
}

export function envPaths(ws, root = process.cwd()) {
  return {
    env: path.join(root, ws, ".env"),
    example: path.join(root, ws, ".env.example"),
  };
}
