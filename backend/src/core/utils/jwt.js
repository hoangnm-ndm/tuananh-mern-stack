import jwt from "jsonwebtoken";
import { AppError, ERROR_CODES } from "../errors/index.js";
import { TOKEN_TYPES } from "../constants/auth.js";

/**
 * Ky va xac minh JWT.
 *
 * Chien luoc 2 token:
 * - Access token: song ngan (vd 15m), gui qua header Authorization, chua {sub, role}.
 * - Refresh token: song dai (vd 7d), luu httpOnly cookie + luu hash trong DB de thu hoi duoc.
 *
 * `type` duoc nhung vao payload de mot access token khong the bi dung nhu refresh token.
 */

/**
 * @param {object} payload Du lieu nhung vao token (khong bao gio chua thong tin nhay cam).
 * @param {object} options
 * @param {string} options.secret
 * @param {string|number} options.expiresIn vd "15m", "7d", hoac so giay.
 * @param {string} [options.type]
 * @param {string} [options.issuer]
 * @param {string} [options.audience]
 */
export function signToken(
  payload,
  { secret, expiresIn, type = TOKEN_TYPES.ACCESS, issuer, audience },
) {
  if (!secret) throw AppError.internal("Thieu secret khi ky JWT");
  return jwt.sign({ ...payload, type }, secret, {
    expiresIn,
    ...(issuer ? { issuer } : {}),
    ...(audience ? { audience } : {}),
  });
}

/**
 * Xac minh token va kiem tra dung `type`.
 * Nem AppError 401 voi errorCode phan biet het han / khong hop le.
 */
export function verifyToken(token, { secret, type = TOKEN_TYPES.ACCESS, issuer, audience } = {}) {
  try {
    const decoded = jwt.verify(token, secret, {
      ...(issuer ? { issuer } : {}),
      ...(audience ? { audience } : {}),
    });

    if (type && decoded.type !== type) {
      throw AppError.unauthorized("Loai token khong hop le", ERROR_CODES.TOKEN_INVALID);
    }
    return decoded;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error?.name === "TokenExpiredError") {
      throw AppError.unauthorized("Token da het han", ERROR_CODES.TOKEN_EXPIRED);
    }
    throw AppError.unauthorized("Token khong hop le", ERROR_CODES.TOKEN_INVALID);
  }
}

/** Giai ma khong xac minh chu ky - CHI dung de doc metadata (vd: exp) khi debug. */
export function decodeToken(token) {
  return jwt.decode(token, { complete: false });
}

/** Lay token tu header "Authorization: Bearer <token>". Tra ve null neu khong co. */
export function extractBearerToken(authorizationHeader) {
  if (typeof authorizationHeader !== "string") return null;
  const [scheme, token] = authorizationHeader.split(" ");
  if (!token || scheme?.toLowerCase() !== "bearer") return null;
  return token.trim() || null;
}
