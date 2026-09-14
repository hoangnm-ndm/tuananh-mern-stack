import { Router } from "express";
import { validate } from "../../core/middlewares/validate.js";
import { createAuthRateLimiter } from "../../core/middlewares/rateLimit.js";
import { env } from "../../config/env.js";
import { requireAuth } from "./auth.middleware.js";
import { authController } from "./auth.controller.js";
import {
  googleCallbackQuerySchema,
  loginSchema,
  magicLinkRequestSchema,
  magicLinkVerifySchema,
  refreshSchema,
  registerSchema,
} from "./auth.validation.js";

const router = Router();

/**
 * Rate limit chat cho cac endpoint co the bi do mat khau / spam mail.
 * Tat o moi truong test de khong lam nhieu ket qua kiem thu.
 */
const authLimiter = env.isTest
  ? (_req, _res, next) => next()
  : createAuthRateLimiter({ windowMs: env.RATE_LIMIT_WINDOW_MS, max: env.AUTH_RATE_LIMIT_MAX });

// ---------- Phuong thuc 1: Email + mat khau ----------
router.post("/register", authLimiter, validate({ body: registerSchema }), authController.register);
router.post("/login", authLimiter, validate({ body: loginSchema }), authController.login);

// ---------- Phuong thuc 2: Google OAuth ----------
router.get("/google", authController.googleRedirect);
router.get(
  "/google/callback",
  validate({ query: googleCallbackQuerySchema }),
  authController.googleCallback,
);

// ---------- Phuong thuc 3: Magic link ----------
router.post(
  "/magic-link",
  authLimiter,
  validate({ body: magicLinkRequestSchema }),
  authController.requestMagicLink,
);
router.post(
  "/magic-link/verify",
  validate({ body: magicLinkVerifySchema }),
  authController.verifyMagicLink,
);

// ---------- Vong doi phien ----------
router.post("/refresh", validate({ body: refreshSchema }), authController.refresh);
router.post("/logout", authController.logout);
router.post("/logout-all", requireAuth, authController.logoutAll);
router.get("/me", requireAuth, authController.me);

export default router;
