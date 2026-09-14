import { AppError, ERROR_CODES } from "../errors/index.js";
import { extractBearerToken, verifyToken } from "../utils/jwt.js";
import { TOKEN_TYPES } from "../constants/auth.js";

/**
 * Xac thuc (authentication) - "ban la ai?".
 *
 * Doc access token tu header `Authorization: Bearer <token>`, xac minh chu ky,
 * roi nap nguoi dung tu DB (de role/trang thai luon la MOI NHAT, khong tin payload cu).
 *
 * Ket qua: gan req.user = tai lieu nguoi dung.
 *
 * @param {object} deps
 * @param {{ getById: (id:string)=>Promise<any> }} deps.userService Lay user theo id.
 * @param {object} deps.jwtConfig { secret, issuer }
 */
export function authenticate({ userService, jwtConfig }) {
  return async (req, _res, next) => {
    try {
      const token = extractBearerToken(req.headers.authorization);
      if (!token) {
        throw AppError.unauthorized("Thieu access token", ERROR_CODES.UNAUTHENTICATED);
      }

      const payload = verifyToken(token, {
        secret: jwtConfig.secret,
        issuer: jwtConfig.issuer,
        type: TOKEN_TYPES.ACCESS,
      });

      const user = await userService.getById(payload.sub).catch(() => null);
      if (!user) {
        throw AppError.unauthorized("Tai khoan khong ton tai", ERROR_CODES.UNAUTHENTICATED);
      }
      if (user.isActive === false) {
        throw AppError.forbidden("Tai khoan da bi vo hieu hoa");
      }

      req.user = user;
      req.tokenPayload = payload;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

/**
 * Bien the "khong bat buoc": co token thi gan req.user, khong co thi van cho di tiep.
 * Dung cho endpoint cong khai nhung tra them du lieu ca nhan hoa khi da dang nhap.
 */
export function optionalAuthenticate({ userService, jwtConfig }) {
  const required = authenticate({ userService, jwtConfig });
  return (req, res, next) => {
    if (!extractBearerToken(req.headers.authorization)) return next();
    required(req, res, (error) => next(error && !(error instanceof AppError) ? error : undefined));
  };
}
