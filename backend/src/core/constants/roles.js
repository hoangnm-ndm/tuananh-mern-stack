/**
 * RBAC - dinh nghia vai tro (role) va quyen (permission).
 *
 * Quy uoc:
 * - ROLES: danh sach vai tro he thong.
 * - ROLE_LEVEL: cap bac dang so -> dung cho so sanh "toi thieu vai tro X".
 * - PERMISSIONS: quyen chi tiet dang "<resource>:<action>".
 * - ROLE_PERMISSIONS: anh xa role -> danh sach quyen (nguon su that duy nhat).
 *
 * Mo rong module moi: them quyen vao PERMISSIONS roi gan vao ROLE_PERMISSIONS.
 */

export const ROLES = Object.freeze({
  MEMBER: "member",
  ADMIN: "admin",
  SUPER_ADMIN: "superAdmin",
});

export const ROLE_VALUES = Object.freeze(Object.values(ROLES));

/** Cap bac cang cao cang nhieu quyen. Dung cho middleware requireMinRole(). */
export const ROLE_LEVEL = Object.freeze({
  [ROLES.MEMBER]: 1,
  [ROLES.ADMIN]: 2,
  [ROLES.SUPER_ADMIN]: 3,
});

export const PERMISSIONS = Object.freeze({
  // Quan ly nguoi dung
  USER_READ: "user:read",
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",
  USER_MANAGE_ROLE: "user:manage-role",

  // Module mau (product)
  PRODUCT_READ: "product:read",
  PRODUCT_CREATE: "product:create",
  PRODUCT_UPDATE: "product:update",
  PRODUCT_DELETE: "product:delete",

  // Tac vu he thong
  SYSTEM_SETTINGS: "system:settings",
});

/** Quyen danh cho MEMBER (nguoi dung thong thuong). */
const MEMBER_PERMISSIONS = [PERMISSIONS.PRODUCT_READ];

/** ADMIN = MEMBER + quan tri noi dung + doc/sua user. */
const ADMIN_PERMISSIONS = [
  ...MEMBER_PERMISSIONS,
  PERMISSIONS.PRODUCT_CREATE,
  PERMISSIONS.PRODUCT_UPDATE,
  PERMISSIONS.PRODUCT_DELETE,
  PERMISSIONS.USER_READ,
  PERMISSIONS.USER_UPDATE,
];

/** SUPER_ADMIN = toan quyen. */
const SUPER_ADMIN_PERMISSIONS = Object.values(PERMISSIONS);

export const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.MEMBER]: Object.freeze(MEMBER_PERMISSIONS),
  [ROLES.ADMIN]: Object.freeze(ADMIN_PERMISSIONS),
  [ROLES.SUPER_ADMIN]: Object.freeze(SUPER_ADMIN_PERMISSIONS),
});

/** Lay toan bo quyen cua mot role. Role la, tra ve mang rong. */
export function getPermissionsOfRole(role) {
  return ROLE_PERMISSIONS[role] ?? [];
}

/** Kiem tra role co MOT trong cac quyen yeu cau hay khong. */
export function roleHasAnyPermission(role, requiredPermissions = []) {
  if (requiredPermissions.length === 0) return true;
  const granted = getPermissionsOfRole(role);
  return requiredPermissions.some((permission) => granted.includes(permission));
}

/** Kiem tra role co TAT CA cac quyen yeu cau hay khong. */
export function roleHasAllPermissions(role, requiredPermissions = []) {
  const granted = getPermissionsOfRole(role);
  return requiredPermissions.every((permission) => granted.includes(permission));
}

/** So sanh cap bac: role hien tai >= role toi thieu? */
export function roleIsAtLeast(role, minimumRole) {
  return (ROLE_LEVEL[role] ?? 0) >= (ROLE_LEVEL[minimumRole] ?? Infinity);
}
