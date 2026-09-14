import { REFRESH_COOKIE_NAME } from "../constants/auth.js";

/**
 * Quan ly cookie chua refresh token.
 *
 * Vi sao dung httpOnly cookie thay vi localStorage?
 * - httpOnly: JavaScript khong doc duoc -> giam thiet hai khi bi XSS.
 * - sameSite=lax/strict: giam nguy co CSRF.
 * - secure: chi gui qua HTTPS (bat o production).
 */

export function buildRefreshCookieOptions({ maxAgeMs, isProduction, sameSite = "lax", domain }) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? sameSite : "lax",
    maxAge: maxAgeMs,
    path: "/",
    ...(domain ? { domain } : {}),
  };
}

export function setRefreshCookie(res, token, options) {
  res.cookie(REFRESH_COOKIE_NAME, token, options);
}

export function clearRefreshCookie(res, options = {}) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/", ...options });
}

export function readRefreshCookie(req) {
  return req.cookies?.[REFRESH_COOKIE_NAME] ?? null;
}
