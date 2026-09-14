import { useContext } from "react";
import { AuthContext } from "./AuthContext.js";
import { ROLES } from "../config/constants.js";

/** Cap bac vai tro - phai khop voi ROLE_LEVEL cua backend. */
const ROLE_LEVEL = {
  [ROLES.MEMBER]: 1,
  [ROLES.ADMIN]: 2,
  [ROLES.SUPER_ADMIN]: 3,
};

/**
 * Hook truy cap trang thai dang nhap + cac ham kiem tra quyen.
 *
 * LUU Y BAO MAT: kiem tra o day chi de HIEN THI dung giao dien (an nut, an menu).
 * Ke tan cong hoan toan co the sua bien trong DevTools. Quyet dinh cuoi cung
 * LUON thuoc ve backend.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phai duoc dung ben trong <AuthProvider>");
  }

  const { user, permissions } = context;

  return {
    ...context,

    /** Co it nhat MOT trong cac quyen liet ke. */
    hasPermission: (...required) =>
      required.flat().some((permission) => permissions.includes(permission)),

    /** Co TAT CA cac quyen liet ke. */
    hasAllPermissions: (...required) =>
      required.flat().every((permission) => permissions.includes(permission)),

    /** Vai tro nam trong danh sach. */
    hasRole: (...roles) => roles.flat().includes(user?.role),

    /** Vai tro tu mot cap bac tro len. */
    hasMinRole: (minimumRole) =>
      (ROLE_LEVEL[user?.role] ?? 0) >= (ROLE_LEVEL[minimumRole] ?? Infinity),

    isAdmin: (ROLE_LEVEL[user?.role] ?? 0) >= ROLE_LEVEL[ROLES.ADMIN],
    isSuperAdmin: user?.role === ROLES.SUPER_ADMIN,
  };
}
