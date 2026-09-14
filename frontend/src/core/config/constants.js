/**
 * Hang so dung chung phia frontend.
 * ROLES / PERMISSIONS phai KHOP voi backend (backend/src/core/constants/roles.js).
 * Day chi de HIEN THI dung giao dien - quyet dinh cuoi cung luon thuoc ve backend.
 */

export const ROLES = Object.freeze({
  MEMBER: "member",
  ADMIN: "admin",
  SUPER_ADMIN: "superAdmin",
});

export const ROLE_LABELS = Object.freeze({
  [ROLES.MEMBER]: "Thanh vien",
  [ROLES.ADMIN]: "Quan tri vien",
  [ROLES.SUPER_ADMIN]: "Quan tri cap cao",
});

export const PERMISSIONS = Object.freeze({
  USER_READ: "user:read",
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",
  USER_MANAGE_ROLE: "user:manage-role",
  PRODUCT_READ: "product:read",
  PRODUCT_CREATE: "product:create",
  PRODUCT_UPDATE: "product:update",
  PRODUCT_DELETE: "product:delete",
  SYSTEM_SETTINGS: "system:settings",
});

/** Ma loi backend tra ve - dung de xu ly rieng tung truong hop. */
export const ERROR_CODES = Object.freeze({
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_INVALID: "TOKEN_INVALID",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  FORBIDDEN: "FORBIDDEN",
  INSUFFICIENT_PERMISSION: "INSUFFICIENT_PERMISSION",
  MAGIC_LINK_INVALID: "MAGIC_LINK_INVALID",
  NOT_FOUND: "NOT_FOUND",
});

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50];
