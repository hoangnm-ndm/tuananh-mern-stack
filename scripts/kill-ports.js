#!/usr/bin/env node
/**
 * Tat cac tien trinh dang chiem cong dev (yeu cau #11: luon tat tien trinh ngam).
 * Dung: npm run kill:ports  hoac  node scripts/kill-ports.js 8000 5173
 */
import { execSync } from "node:child_process";

const DEFAULT_PORTS = [8000, 5173, 4173];
const ports = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_PORTS;

for (const port of ports) {
  try {
    const pids = execSync(`lsof -ti tcp:${port}`, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim()
      .split("\n")
      .filter(Boolean);
    if (!pids.length) {
      console.info(`port ${port}: trong`);
      continue;
    }
    for (const pid of pids) process.kill(Number(pid), "SIGTERM");
    console.info(`port ${port}: da dung PID ${pids.join(", ")}`);
  } catch {
    console.info(`port ${port}: trong`);
  }
}
