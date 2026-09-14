import { NavLink, Outlet, Link } from "react-router";
import { useAuth } from "@/core/auth/useAuth.js";
import { useAuthActions } from "@/features/auth/useAuthActions.js";
import { Button } from "@/core/components/ui/Button.jsx";
import { PERMISSIONS, ROLE_LABELS } from "@/core/config/constants.js";
import { PATHS } from "@/core/router/paths.js";

/**
 * Bo cuc khu vuc quan tri - thanh ben trai.
 * Muc menu duoc AN theo quyen -> nguoi dung khong thay thu ho khong dung duoc.
 */
export default function AdminLayout() {
  const { user, hasPermission } = useAuth();
  const { logout } = useAuthActions();

  const menuItems = [
    { to: PATHS.ADMIN_DASHBOARD, label: "Tong quan", end: true, permission: null },
    { to: PATHS.ADMIN_PRODUCTS, label: "San pham", permission: PERMISSIONS.PRODUCT_READ },
    { to: PATHS.ADMIN_USERS, label: "Nguoi dung", permission: PERMISSIONS.USER_READ },
  ].filter((item) => !item.permission || hasPermission(item.permission));

  const linkClass = ({ isActive }) =>
    `block rounded-lg px-3 py-2 text-sm transition ${
      isActive ? "bg-indigo-50 font-semibold text-indigo-700" : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
        <Link to={PATHS.HOME} className="mb-6 block text-lg font-bold text-slate-900">
          Quan tri
        </Link>

        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <p className="text-sm font-medium text-slate-900">{user?.name}</p>
          <p className="mb-3 text-xs text-slate-500">{ROLE_LABELS[user?.role] ?? user?.role}</p>
          <Button size="sm" variant="secondary" onClick={logout} className="w-full">
            Dang xuat
          </Button>
        </div>
      </aside>

      <main className="flex-1 px-4 py-6 md:px-8">
        {/* Menu rut gon cho man hinh hep */}
        <nav className="mb-5 flex gap-2 overflow-x-auto md:hidden">
          {menuItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Outlet />
      </main>
    </div>
  );
}
