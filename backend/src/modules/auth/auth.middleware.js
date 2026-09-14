import { authenticate, optionalAuthenticate } from "../../core/middlewares/authenticate.js";
import { env } from "../../config/env.js";
import { userService } from "../user/user.service.js";

/**
 * "Noi day" middleware xac thuc tong quat o core voi cau hinh + service that cua ung dung.
 *
 * Nho tach lam 2 lop:
 * - core/middlewares/authenticate.js: thuan logic, nhan dependency -> de viet test.
 * - file nay: ban cu the cua du an -> route chi can `import { requireAuth }`.
 */
const jwtConfig = { secret: env.JWT_ACCESS_SECRET, issuer: env.JWT_ISSUER };

export const requireAuth = authenticate({ userService, jwtConfig });
export const attachUserIfPresent = optionalAuthenticate({ userService, jwtConfig });
