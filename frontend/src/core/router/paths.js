/**
 * TOAN BO duong dan cua ung dung khai bao tai MOT noi.
 *
 * Loi ich: doi "/san-pham" thanh "/products" chi sua o day,
 * khong phai di tim tung chuoi rai rac trong hang chuc file.
 */
export const PATHS = {
  // ---------- Cong khai ----------
  HOME: "/",
  PRODUCTS: "/san-pham",
  PRODUCT_DETAIL: "/san-pham/:slug",
  ABOUT: "/ve-chung-toi",
  CONTACT: "/lien-he",

  // ---------- Xac thuc ----------
  LOGIN: "/dang-nhap",
  REGISTER: "/dang-ky",
  MAGIC_LINK_CALLBACK: "/auth/magic-link/callback",
  OAUTH_CALLBACK: "/auth/oauth/callback",

  // ---------- Khu vuc quan tri ----------
  ADMIN: "/admin",
  ADMIN_DASHBOARD: "/admin",
  ADMIN_PRODUCTS: "/admin/san-pham",
  ADMIN_USERS: "/admin/nguoi-dung",

  // ---------- Tai khoan ----------
  PROFILE: "/tai-khoan",

  // ---------- Trang loi ----------
  FORBIDDEN: "/khong-co-quyen",
  NOT_FOUND: "*",
};

/** Thay tham so dong: buildPath(PATHS.PRODUCT_DETAIL, { slug: "ao-thun" }) */
export function buildPath(pattern, params = {}) {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, encodeURIComponent(value)),
    pattern,
  );
}
