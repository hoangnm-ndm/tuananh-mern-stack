import crypto from "node:crypto";
import { logger } from "../utils/logger.js";

/**
 * Gan requestId cho moi request + log thoi gian xu ly.
 * requestId giup noi cac dong log cua cung mot request khi debug production.
 */
export function requestContext() {
  return (req, res, next) => {
    const requestId = req.headers["x-request-id"] || crypto.randomUUID();

    req.id = requestId;
    req.logger = logger.child({ requestId });
    res.setHeader("X-Request-Id", requestId);

    const startedAt = process.hrtime.bigint();

    res.on("finish", () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
      const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
      req.logger[level](`${req.method} ${req.originalUrl}`, {
        status: res.statusCode,
        durationMs: Number(durationMs.toFixed(2)),
      });
    });

    next();
  };
}
