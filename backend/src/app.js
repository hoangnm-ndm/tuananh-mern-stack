import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import apiRouter from "./routes/index.js";
import { requestContext } from "./core/middlewares/requestContext.js";
import { createGlobalRateLimiter } from "./core/middlewares/rateLimit.js";
import { notFoundHandler } from "./core/middlewares/notFound.js";
import { errorHandler } from "./core/middlewares/errorHandler.js";
import { AppError } from "./core/errors/index.js";

/**
 * Tao Express app duoi dang HAM (app factory).
 *
 * Vi sao khong export thang `app`?
 * - Test co the tao nhieu app doc lap voi cau hinh khac nhau.
 * - Tach hoan toan viec "dung app" khoi viec "lang nghe cong" (xem index.js).
 *
 * THU TU middleware rat quan trong:
 *   bao mat -> parser -> context/log -> rate limit -> route -> 404 -> error handler
 */
export function createApp(config = env) {
  const app = express();

  // Sau reverse proxy (Nginx, Cloudflare): tin header X-Forwarded-For de lay dung IP that
  if (config.isProduction) app.set("trust proxy", 1);
  app.disable("x-powered-by");

  // ---------- 1. Bao mat ----------
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin(origin, callback) {
        // Cho phep request khong co Origin (curl, mobile app, server-to-server)
        if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
        return callback(AppError.forbidden(`Origin khong duoc phep: ${origin}`));
      },
      credentials: true, // bat buoc de trinh duyet gui cookie refresh token
    }),
  );

  // ---------- 2. Parser ----------
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser());
  app.use(compression());

  // ---------- 3. Context + log ----------
  app.use(requestContext());

  // ---------- 4. Rate limit toan cuc (tat khi chay test) ----------
  if (!config.isTest) {
    app.use(
      createGlobalRateLimiter({
        windowMs: config.RATE_LIMIT_WINDOW_MS,
        max: config.RATE_LIMIT_MAX,
      }),
    );
  }

  // ---------- 5. Route ----------
  app.use(config.API_PREFIX, apiRouter);

  // ---------- 6. 404 + xu ly loi (luon dat cuoi cung) ----------
  app.use(notFoundHandler());
  app.use(errorHandler({ isProduction: config.isProduction }));

  return app;
}

export default createApp;
