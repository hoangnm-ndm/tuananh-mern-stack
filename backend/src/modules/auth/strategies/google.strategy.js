import { OAuth2Client } from "google-auth-library";
import { AppError, ERROR_CODES } from "../../../core/errors/index.js";
import { env } from "../../../config/env.js";

/**
 * Google OAuth 2.0 - luong Authorization Code.
 *
 * Cac buoc:
 *   1. Client goi GET /auth/google        -> backend tra ve URL dong y cua Google
 *   2. Nguoi dung dong y tren trang Google
 *   3. Google chuyen huong ve GOOGLE_CALLBACK_URL kem ?code=...&state=...
 *   4. Backend doi `code` lay `id_token`, xac minh chu ky, lay ho so
 *
 * `state` la chuoi ngau nhien de chong CSRF: backend sinh ra, luu vao cookie,
 * roi doi chieu khi Google tra ve.
 *
 * Lop nay duoc viet duoi dang class nhan client -> test co the truyen client gia lap.
 */
export class GoogleStrategy {
  constructor({ clientId, clientSecret, callbackUrl, client } = {}) {
    this.clientId = clientId ?? env.GOOGLE_CLIENT_ID;
    this.clientSecret = clientSecret ?? env.GOOGLE_CLIENT_SECRET;
    this.callbackUrl = callbackUrl ?? env.GOOGLE_CALLBACK_URL;
    this._client = client ?? null;
  }

  get isConfigured() {
    return Boolean(this.clientId && this.clientSecret && this.callbackUrl);
  }

  /** Khoi tao client lazy -> khong bat buoc cau hinh Google khi tinh nang dang tat. */
  get client() {
    if (!this._client) {
      if (!this.isConfigured) {
        throw AppError.internal(
          "Google OAuth chua duoc cau hinh (thieu GOOGLE_CLIENT_ID/SECRET/CALLBACK_URL)",
        );
      }
      this._client = new OAuth2Client(this.clientId, this.clientSecret, this.callbackUrl);
    }
    return this._client;
  }

  /** Buoc 1: tao URL dua nguoi dung sang trang dong y cua Google. */
  buildAuthUrl(state) {
    return this.client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["openid", "email", "profile"],
      state,
    });
  }

  /**
   * Buoc 4: doi authorization code lay ho so nguoi dung da xac minh.
   * @returns {Promise<{providerId: string, email: string, name: string, avatarUrl: string|null, isEmailVerified: boolean}>}
   */
  async exchangeCodeForProfile(code) {
    try {
      const { tokens } = await this.client.getToken(code);
      if (!tokens?.id_token) {
        throw AppError.unauthorized("Google khong tra ve id_token", ERROR_CODES.OAUTH_FAILED);
      }

      const ticket = await this.client.verifyIdToken({
        idToken: tokens.id_token,
        audience: this.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload?.email) {
        throw AppError.unauthorized("Tai khoan Google khong co email", ERROR_CODES.OAUTH_FAILED);
      }

      return {
        providerId: payload.sub,
        email: payload.email.toLowerCase(),
        name: payload.name ?? payload.email.split("@")[0],
        avatarUrl: payload.picture ?? null,
        isEmailVerified: Boolean(payload.email_verified),
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.unauthorized(
        `Xac thuc Google that bai: ${error.message}`,
        ERROR_CODES.OAUTH_FAILED,
      );
    }
  }
}

export const googleStrategy = new GoogleStrategy();
