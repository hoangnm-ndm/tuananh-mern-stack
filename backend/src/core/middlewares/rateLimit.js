import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { AppError } from "../errors/index.js";

/**
 * Gioi han so request - chong brute force va lam dung API.
 *
 * Luu y khi trien khai that:
 * - Sau reverse proxy (Nginx/Cloudflare) phai bat `app.set("trust proxy", 1)`
 *   neu khong tat ca request se bi coi la cung 1 IP.
 * - Store mac dinh nam trong RAM -> chi dung cho 1 instance.
 *   Nhieu instance thi chuyen sang store Redis (Phase 3).
 */

function handler(_req, _res, next) {
  next(AppError.tooManyRequests());
}

/** Gioi han chung cho toan bo API. */
export function createGlobalRateLimiter({ windowMs, max }) {
  return rateLimit({
    windowMs,
    limit: max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler,
  });
}

/**
 * Gioi han chat hon cho cac endpoint nhay cam (dang nhap, gui magic link...).
 * Dem theo IP + email de mot IP khong the do mat khau nhieu tai khoan.
 */
export function createAuthRateLimiter({ windowMs, max }) {
  return rateLimit({
    windowMs,
    limit: max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    // ipKeyGenerator chuan hoa IPv6 (gom theo /64) - neu dung req.ip thuan,
    // mot nguoi dung IPv6 co the doi dia chi lien tuc de vuot gioi han.
    keyGenerator: (req) => `${ipKeyGenerator(req.ip)}:${req.body?.email ?? "unknown"}`,
    handler,
  });
}
