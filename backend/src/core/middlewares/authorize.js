import { AppError, ERROR_CODES } from "../errors/index.js";
import {
  ROLES,
  roleHasAllPermissions,
  roleHasAnyPermission,
  roleIsAtLeast,
} from "../constants/roles.js";

/**
 * Phan quyen (authorization) - "ban duoc lam gi?".
 * LUON dat SAU authenticate().
 *
 * Co 3 cach dung, chon cach phu hop voi tung route:
 *   requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN)   -> theo danh sach vai tro
 *   requireMinRole(ROLES.ADMIN)                   -> theo cap bac toi thieu
 *   requirePermission(PERMISSIONS.PRODUCT_CREATE) -> theo quyen chi tiet (khuyen dung)
 */

function ensureAuthenticated(req) {
  if (!req.user) {
    throw AppError.unauthorized("Ban can dang nhap de thuc hien hanh dong nay");
  }
}

/** Chi cho phep cac vai tro liet ke. */
export function requireRole(...allowedRoles) {
  const roles = allowedRoles.flat();
  return (req, _res, next) => {
    try {
      ensureAuthenticated(req);
      if (!roles.includes(req.user.role)) {
        throw new AppError("Vai tro cua ban khong duoc phep truy cap tai nguyen nay", {
          statusCode: 403,
          errorCode: ERROR_CODES.FORBIDDEN,
          details: { requiredRoles: roles, currentRole: req.user.role },
        });
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

/** Cho phep tu mot cap bac tro len (member < admin < superAdmin). */
export function requireMinRole(minimumRole) {
  return (req, _res, next) => {
    try {
      ensureAuthenticated(req);
      if (!roleIsAtLeast(req.user.role, minimumRole)) {
        throw new AppError(`Hanh dong nay yeu cau vai tro toi thieu: ${minimumRole}`, {
          statusCode: 403,
          errorCode: ERROR_CODES.FORBIDDEN,
          details: { minimumRole, currentRole: req.user.role },
        });
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

/**
 * Kiem tra quyen chi tiet.
 * @param {...string} permissions
 */
export function requirePermission(...permissions) {
  const required = permissions.flat();
  return (req, _res, next) => {
    try {
      ensureAuthenticated(req);
      if (!roleHasAnyPermission(req.user.role, required)) {
        throw new AppError("Ban khong co quyen thuc hien hanh dong nay", {
          statusCode: 403,
          errorCode: ERROR_CODES.INSUFFICIENT_PERMISSION,
          details: { requiredPermissions: required, currentRole: req.user.role },
        });
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

/** Bat buoc co TAT CA cac quyen liet ke. */
export function requireAllPermissions(...permissions) {
  const required = permissions.flat();
  return (req, _res, next) => {
    try {
      ensureAuthenticated(req);
      if (!roleHasAllPermissions(req.user.role, required)) {
        throw new AppError("Ban khong co du quyen thuc hien hanh dong nay", {
          statusCode: 403,
          errorCode: ERROR_CODES.INSUFFICIENT_PERMISSION,
          details: { requiredPermissions: required, currentRole: req.user.role },
        });
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

/**
 * Cho phep khi nguoi dung LA CHU so huu ban ghi, HOAC co quyen quan tri.
 * Dung cho cac route dang "sua ho so cua chinh minh".
 *
 * @param {object} options
 * @param {(req:any)=>string} options.getOwnerId Lay id chu so huu tu request.
 * @param {string[]} [options.bypassRoles] Vai tro duoc bo qua kiem tra chu so huu.
 */
export function requireOwnershipOr({ getOwnerId, bypassRoles = [ROLES.ADMIN, ROLES.SUPER_ADMIN] }) {
  return async (req, _res, next) => {
    try {
      ensureAuthenticated(req);
      if (bypassRoles.includes(req.user.role)) return next();

      const ownerId = await getOwnerId(req);
      const currentUserId = String(req.user.id ?? req.user._id);

      if (!ownerId || String(ownerId) !== currentUserId) {
        throw AppError.forbidden("Ban chi co the thao tac tren du lieu cua chinh minh");
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };
}
