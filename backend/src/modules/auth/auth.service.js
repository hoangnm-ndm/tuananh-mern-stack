import { AppError, ERROR_CODES } from "../../core/errors/index.js";
import { AUTH_PROVIDERS, TOKEN_TYPES } from "../../core/constants/auth.js";
import { signToken, verifyToken } from "../../core/utils/jwt.js";
import { comparePassword } from "../../core/utils/password.js";
import { generateRandomToken } from "../../core/utils/crypto.js";
import { addDuration, parseDuration } from "../../core/utils/time.js";
import { env } from "../../config/env.js";
import { userService } from "../user/user.service.js";
import { mailService } from "../../shared/services/mail.service.js";
import { tokenRepository } from "./token.repository.js";
import { googleStrategy } from "./strategies/google.strategy.js";

/**
 * AuthService - toan bo nghiep vu xac thuc, khong phu thuoc Express.
 *
 * Ho tro 3 phuong thuc dang nhap, tat ca deu KET THUC o cung mot cho:
 * `issueSession()` -> tra ve { user, accessToken, refreshToken }.
 * Nho vay controller va frontend chi can xu ly MOT dang ket qua.
 *
 * Dependency duoc tiem qua constructor -> unit test khong can DB that.
 */
export class AuthService {
  constructor({
    users = userService,
    tokens = tokenRepository,
    mailer = mailService,
    google = googleStrategy,
    config = env,
  } = {}) {
    this.users = users;
    this.tokens = tokens;
    this.mailer = mailer;
    this.google = google;
    this.config = config;
  }

  // ==========================================================================
  // Phat hanh phien dang nhap (dung chung cho ca 3 phuong thuc)
  // ==========================================================================

  /**
   * Tao cap access/refresh token cho mot nguoi dung.
   * Refresh token duoc luu HASH vao DB de co the thu hoi.
   */
  async issueSession(user, { userAgent, ipAddress } = {}) {
    const userId = String(user.id ?? user._id);

    /**
     * `jti` (JWT ID) la chuoi ngau nhien duy nhat cho MOI token.
     * Bat buoc phai co: neu khong, hai token cap trong cung MOT GIAY cho cung
     * mot nguoi dung se co payload y het nhau (cung `sub`, cung `iat`) -> chuoi JWT
     * trung nhau -> dung unique index `tokenHash` khi luu refresh token.
     */
    const accessToken = signToken(
      { sub: userId, role: user.role, email: user.email, jti: generateRandomToken(12) },
      {
        secret: this.config.JWT_ACCESS_SECRET,
        expiresIn: this.config.JWT_ACCESS_EXPIRES_IN,
        issuer: this.config.JWT_ISSUER,
        type: TOKEN_TYPES.ACCESS,
      },
    );

    const refreshToken = signToken(
      { sub: userId, jti: generateRandomToken(16) },
      {
        secret: this.config.JWT_REFRESH_SECRET,
        expiresIn: this.config.JWT_REFRESH_EXPIRES_IN,
        issuer: this.config.JWT_ISSUER,
        type: TOKEN_TYPES.REFRESH,
      },
    );

    await this.tokens.issue({
      userId,
      rawToken: refreshToken,
      type: TOKEN_TYPES.REFRESH,
      expiresAt: addDuration(this.config.JWT_REFRESH_EXPIRES_IN),
      userAgent,
      ipAddress,
    });

    await this.users.touchLastLogin(userId).catch(() => {});

    return {
      user: typeof user.toJSON === "function" ? user.toJSON() : user,
      accessToken,
      refreshToken,
      expiresIn: Math.floor(parseDuration(this.config.JWT_ACCESS_EXPIRES_IN) / 1000),
    };
  }

  // ==========================================================================
  // Phuong thuc 1: Email + mat khau
  // ==========================================================================

  async register({ email, password, name }, context = {}) {
    const user = await this.users.createWithPassword({ email, password, name });
    await this.mailer.sendWelcome({ to: user.email, name: user.name }).catch(() => {});
    return this.issueSession(user, context);
  }

  async loginWithPassword({ email, password }, context = {}) {
    const user = await this.users.findByEmail(email, { withPassword: true });

    // Thong bao GIONG NHAU cho "khong co email" va "sai mat khau"
    // -> khong de lo email nao da dang ky (user enumeration).
    if (!user?.password) {
      throw AppError.unauthorized(
        "Email hoac mat khau khong dung",
        ERROR_CODES.INVALID_CREDENTIALS,
      );
    }

    const matched = await comparePassword(password, user.password);
    if (!matched) {
      throw AppError.unauthorized(
        "Email hoac mat khau khong dung",
        ERROR_CODES.INVALID_CREDENTIALS,
      );
    }

    if (!user.isActive) {
      throw AppError.forbidden("Tai khoan da bi vo hieu hoa");
    }

    return this.issueSession(user, context);
  }

  // ==========================================================================
  // Phuong thuc 2: Google OAuth
  // ==========================================================================

  /** Tra ve URL dong y cua Google + state de controller luu vao cookie. */
  buildGoogleAuthUrl(state) {
    this.#assertGoogleEnabled();
    return this.google.buildAuthUrl(state);
  }

  /** Xu ly callback: doi code lay ho so -> tim hoac tao user -> phat hanh phien. */
  async loginWithGoogle({ code }, context = {}) {
    this.#assertGoogleEnabled();

    const profile = await this.google.exchangeCodeForProfile(code);

    const { user, isNewUser } = await this.users.findOrCreateByProvider({
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      provider: AUTH_PROVIDERS.GOOGLE,
      providerId: profile.providerId,
      isEmailVerified: profile.isEmailVerified,
    });

    if (!user.isActive) throw AppError.forbidden("Tai khoan da bi vo hieu hoa");

    const session = await this.issueSession(user, context);
    return { ...session, isNewUser };
  }

  // ==========================================================================
  // Phuong thuc 3: Magic link (dang nhap khong mat khau)
  // ==========================================================================

  /**
   * Gui magic link toi email.
   *
   * Luu y bao mat: LUON tra ve ket qua giong nhau du email co ton tai hay khong,
   * de khong lo danh sach email da dang ky.
   */
  async requestMagicLink({ email }) {
    if (!this.config.MAGIC_LINK_ENABLED) {
      throw AppError.badRequest("Tinh nang dang nhap bang magic link dang tat");
    }

    const rawToken = generateRandomToken(32);
    const existing = await this.users.findByEmail(email);

    // Chi tao user "cho" khi email chua ton tai -> magic link kiem luon vai tro dang ky
    const user =
      existing ??
      (
        await this.users.findOrCreateByProvider({
          email,
          provider: AUTH_PROVIDERS.MAGIC_LINK,
          isEmailVerified: false,
        })
      ).user;

    if (user.isActive) {
      await this.tokens.issue({
        userId: String(user.id ?? user._id),
        rawToken,
        type: TOKEN_TYPES.MAGIC_LINK,
        expiresAt: addDuration(this.config.MAGIC_LINK_EXPIRES_IN),
      });

      const link = `${this.config.CLIENT_URL}${this.config.MAGIC_LINK_REDIRECT_PATH}?token=${rawToken}`;
      await this.mailer.sendMagicLink({ to: user.email, link });
    }

    return {
      message: "Neu email ton tai trong he thong, chung toi da gui lien ket dang nhap.",
      // Chi lo token o moi truong dev/test de tien thu nghiem tu dong
      ...(this.config.isProduction ? {} : { devToken: rawToken }),
    };
  }

  /** Xac minh magic link: token chi dung duoc DUNG MOT LAN. */
  async verifyMagicLink({ token }, context = {}) {
    const record = await this.tokens.consume(token, TOKEN_TYPES.MAGIC_LINK);
    if (!record) {
      throw AppError.unauthorized(
        "Lien ket dang nhap khong hop le hoac da het han",
        ERROR_CODES.MAGIC_LINK_INVALID,
      );
    }

    const user = await this.users.getById(record.user);
    if (!user.isActive) throw AppError.forbidden("Tai khoan da bi vo hieu hoa");

    // Nhan magic link dong nghia voi viec kiem soat hop thu -> coi nhu da xac minh email.
    // Phai dung ban ghi DA CAP NHAT, neu khong response se tra ve trang thai cu.
    const verifiedUser = user.isEmailVerified
      ? user
      : ((await this.users.markEmailVerified(user.id ?? user._id)) ?? user);

    return this.issueSession(verifiedUser, context);
  }

  // ==========================================================================
  // Vong doi phien: refresh / logout
  // ==========================================================================

  /**
   * Cap lai access token tu refresh token (token rotation).
   * Refresh token cu bi thu hoi ngay -> neu ke tan cong dung lai se that bai.
   */
  async refreshSession({ refreshToken }, context = {}) {
    if (!refreshToken) {
      throw AppError.unauthorized("Thieu refresh token", ERROR_CODES.UNAUTHENTICATED);
    }

    const payload = verifyToken(refreshToken, {
      secret: this.config.JWT_REFRESH_SECRET,
      issuer: this.config.JWT_ISSUER,
      type: TOKEN_TYPES.REFRESH,
    });

    const stored = await this.tokens.findUsable(refreshToken, TOKEN_TYPES.REFRESH);
    if (!stored) {
      // Token hop le ve chu ky nhung khong con trong DB -> da bi thu hoi / dung lai
      await this.tokens.revokeAllForUser(payload.sub, TOKEN_TYPES.REFRESH);
      throw AppError.unauthorized(
        "Refresh token da bi thu hoi, vui long dang nhap lai",
        ERROR_CODES.TOKEN_INVALID,
      );
    }

    const user = await this.users.getById(payload.sub);
    if (!user.isActive) throw AppError.forbidden("Tai khoan da bi vo hieu hoa");

    await this.tokens.revoke(refreshToken, TOKEN_TYPES.REFRESH);
    return this.issueSession(user, context);
  }

  /** Dang xuat thiet bi hien tai. */
  async logout({ refreshToken }) {
    if (refreshToken) await this.tokens.revoke(refreshToken, TOKEN_TYPES.REFRESH);
    return true;
  }

  /** Dang xuat khoi TAT CA thiet bi. */
  async logoutAll(userId) {
    await this.tokens.revokeAllForUser(userId, TOKEN_TYPES.REFRESH);
    return true;
  }

  #assertGoogleEnabled() {
    if (!this.config.GOOGLE_OAUTH_ENABLED) {
      throw AppError.badRequest("Dang nhap bang Google dang tat (GOOGLE_OAUTH_ENABLED=false)");
    }
  }
}

export const authService = new AuthService();
