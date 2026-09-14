import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../auth/useAuth.js";
import { FullPageSpinner } from "../components/ui/Spinner.jsx";
import { PATHS } from "./paths.js";

/**
 * Cac "cong chan" duong di.
 *
 * LUU Y BAO MAT: day chi la trai nghiem nguoi dung (khong hien trang khong duoc phep).
 * KHONG phai bien phap bao mat - moi endpoint van phai duoc backend kiem tra.
 *
 * Tat ca deu cho `isInitializing` ket thuc truoc, neu khong nguoi dung
 * se bi day ra trang dang nhap trong tich tac moi lan F5.
 */

/** Bat buoc dang nhap. Ghi nho trang dang muon vao de quay lai sau khi dang nhap. */
export function RequireAuth() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) return <FullPageSpinner label="Dang kiem tra phien dang nhap..." />;

  if (!isAuthenticated) {
    return <Navigate to={PATHS.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
}

/**
 * Bat buoc co quyen (permission) cu the.
 * @param {{ permissions?: string[], roles?: string[], minRole?: string }} props
 */
export function RequirePermission({ permissions = [], roles = [], minRole }) {
  const { isAuthenticated, isInitializing, hasPermission, hasRole, hasMinRole } = useAuth();
  const location = useLocation();

  if (isInitializing) return <FullPageSpinner />;
  if (!isAuthenticated) return <Navigate to={PATHS.LOGIN} state={{ from: location }} replace />;

  const allowed =
    (permissions.length === 0 || hasPermission(permissions)) &&
    (roles.length === 0 || hasRole(roles)) &&
    (!minRole || hasMinRole(minRole));

  if (!allowed) return <Navigate to={PATHS.FORBIDDEN} replace />;

  return <Outlet />;
}

/**
 * Chi danh cho KHACH (chua dang nhap).
 * Da dang nhap ma vao /dang-nhap thi day ve trang chu.
 */
export function RequireGuest() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) return <FullPageSpinner />;
  if (isAuthenticated) return <Navigate to={PATHS.HOME} replace />;

  return <Outlet />;
}
