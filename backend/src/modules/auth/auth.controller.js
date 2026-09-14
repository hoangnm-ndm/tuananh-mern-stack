import { ApiResponse } from "../../core/http/ApiResponse.js";
import { asyncHandler } from "../../core/http/asyncHandler.js";
import { AppError, ERROR_CODES } from "../../core/errors/index.js";
import {
  buildRefreshCookieOptions,
  clearRefreshCookie,
  readRefreshCookie,
  setRefreshCookie,
} from "../../core/utils/cookie.js";
import { generateOAuthState } from "../../core/utils/crypto.js";
import { getPermissionsOfRole } from "../../core/constants/roles.js";
import { parseDuration } from "../../core/utils/time.js";
import { env } from "../../config/env.js";
import { authService } from "./auth.service.js";

const OAUTH_STATE_COOKIE = "oauth_state";

/** Lay thong tin thiet bi de luu kem refresh token (phuc vu dieu tra bao mat). */
function getContext(req) {
  return { userAgent: req.headers["user-agent"], ipAddress: req.ip };
}

function refreshCookieOptions() {
  return buildRefreshCookieOptions({
    maxAgeMs: parseDuration(env.JWT_REFRESH_EXPIRES_IN),
    isProduction: env.isProduction,
    sameSite: env.COOKIE_SAME_SITE,
    domain: env.COOKIE_DOMAIN,
  });
}

/**
 * Gui ket qua dang nhap ve client.
 * - refreshToken -> cookie httpOnly (JavaScript khong doc duoc).
 * - accessToken  -> body (frontend giu trong bo nho, khong luu localStorage).
 */
function sendSession(res, session, message, statusCode = 200) {
  setRefreshCookie(res, session.refreshToken, refreshCookieOptions());

  const body = {
    user: session.user,
    accessToken: session.accessToken,
    expiresIn: session.expiresIn,
    ...(session.isNewUser !== undefined ? { isNewUser: session.isNewUser } : {}),
  };

  return statusCode === 201
    ? ApiResponse.created(res, body, message)
    : ApiResponse.ok(res, body, message);
}

export const authController = {
  // ---------- Email + mat khau ----------

  /** POST /auth/register */
  register: asyncHandler(async (req, res) => {
    const session = await authService.register(req.body, getContext(req));
    return sendSession(res, session, "Dang ky thanh cong", 201);
  }),

  /** POST /auth/login */
  login: asyncHandler(async (req, res) => {
    const session = await authService.loginWithPassword(req.body, getContext(req));
    return sendSession(res, session, "Dang nhap thanh cong");
  }),

  // ---------- Google OAuth ----------

  /**
   * GET /auth/google
   * Sinh `state` chong CSRF, luu vao cookie ngan han roi chuyen huong sang Google.
   * Them ?json=1 de nhan URL duoi dang JSON (huu ich cho SPA/mobile).
   */
  googleRedirect: asyncHandler(async (req, res) => {
    const state = generateOAuthState();

    res.cookie(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
      path: "/",
    });

    const url = authService.buildGoogleAuthUrl(state);

    if (req.query.json === "1") return ApiResponse.ok(res, { url }, "Tao URL dang nhap Google");
    return res.redirect(url);
  }),

  /**
   * GET /auth/google/callback
   * Google chuyen huong ve day. Xac minh state, doi code lay phien,
   * roi chuyen huong nguoi dung ve frontend kem access token.
   */
  googleCallback: asyncHandler(async (req, res) => {
    const { code, state, error } = req.query;

    const clearState = () => res.clearCookie(OAUTH_STATE_COOKIE, { path: "/" });
    const redirectWithError = (reason) => {
      clearState();
      return res.redirect(`${env.CLIENT_URL}/dang-nhap?error=${encodeURIComponent(reason)}`);
    };

    if (error) return redirectWithError(error);
    if (!code) return redirectWithError("missing_code");

    const expectedState = req.cookies?.[OAUTH_STATE_COOKIE];
    if (!expectedState || expectedState !== state) {
      throw AppError.unauthorized("State khong hop le (nghi ngo CSRF)", ERROR_CODES.OAUTH_FAILED);
    }
    clearState();

    const session = await authService.loginWithGoogle({ code }, getContext(req));
    setRefreshCookie(res, session.refreshToken, refreshCookieOptions());

    // Chuyen ve trang trung gian cua frontend; frontend doc token tu URL roi doi sang bo nho
    const redirectUrl = new URL("/auth/oauth/callback", env.CLIENT_URL);
    redirectUrl.searchParams.set("accessToken", session.accessToken);
    if (session.isNewUser) redirectUrl.searchParams.set("isNewUser", "1");

    return res.redirect(redirectUrl.toString());
  }),

  // ---------- Magic link ----------

  /** POST /auth/magic-link */
  requestMagicLink: asyncHandler(async (req, res) => {
    const result = await authService.requestMagicLink(req.body);
    return ApiResponse.ok(res, result, result.message);
  }),

  /** POST /auth/magic-link/verify */
  verifyMagicLink: asyncHandler(async (req, res) => {
    const session = await authService.verifyMagicLink(req.body, getContext(req));
    return sendSession(res, session, "Dang nhap thanh cong");
  }),

  // ---------- Vong doi phien ----------

  /** POST /auth/refresh */
  refresh: asyncHandler(async (req, res) => {
    const refreshToken = readRefreshCookie(req) ?? req.body?.refreshToken;
    const session = await authService.refreshSession({ refreshToken }, getContext(req));
    return sendSession(res, session, "Lam moi phien thanh cong");
  }),

  /** POST /auth/logout */
  logout: asyncHandler(async (req, res) => {
    const refreshToken = readRefreshCookie(req) ?? req.body?.refreshToken;
    await authService.logout({ refreshToken });
    clearRefreshCookie(res, { domain: env.COOKIE_DOMAIN });
    return ApiResponse.ok(res, null, "Dang xuat thanh cong");
  }),

  /** POST /auth/logout-all - can dang nhap */
  logoutAll: asyncHandler(async (req, res) => {
    await authService.logoutAll(req.user.id);
    clearRefreshCookie(res, { domain: env.COOKIE_DOMAIN });
    return ApiResponse.ok(res, null, "Da dang xuat khoi tat ca thiet bi");
  }),

  /** GET /auth/me - thong tin nguoi dang dang nhap KEM danh sach quyen */
  me: asyncHandler(async (req, res) => {
    const user = typeof req.user.toJSON === "function" ? req.user.toJSON() : req.user;
    return ApiResponse.ok(
      res,
      { ...user, permissions: getPermissionsOfRole(user.role) },
      "Lay thong tin nguoi dung thanh cong",
    );
  }),
};
