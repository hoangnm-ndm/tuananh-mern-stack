/** Hang so lien quan toi xac thuc (authentication). */

export const AUTH_PROVIDERS = Object.freeze({
  LOCAL: "local",
  GOOGLE: "google",
  MAGIC_LINK: "magicLink",
});

export const TOKEN_TYPES = Object.freeze({
  ACCESS: "access",
  REFRESH: "refresh",
  MAGIC_LINK: "magicLink",
  RESET_PASSWORD: "resetPassword",
  VERIFY_EMAIL: "verifyEmail",
});

/** Ten cookie chua refresh token (httpOnly). */
export const REFRESH_COOKIE_NAME = "refresh_token";
