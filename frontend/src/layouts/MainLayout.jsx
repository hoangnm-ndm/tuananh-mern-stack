import { Link, NavLink, Outlet } from "react-router";
import { useAuth } from "@/core/auth/useAuth.js";
import { useAuthActions } from "@/features/auth/useAuthActions.js";
import { Button } from "@/core/components/ui/Button.jsx";
import { PATHS } from "@/core/router/paths.js";
import { env } from "@/core/config/env.js";

/** Bo cuc cho khu vuc cong khai (trang chu, san pham, lien he...). */
export default function MainLayout() {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const { logout } = useAuthActions();

  const navLinkClass = ({ isActive }) =>
    `text-sm transition ${isActive ? "font-semibold text-indigo-600" : "text-slate-600 hover:text-slate-900"}`;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link to={PATHS.HOME} className="text-lg font-bold text-slate-900">
            {env.APP_NAME}
          </Link>

          <nav className="flex flex-wrap items-center gap-5">
            <NavLink to={PATHS.HOME} end className={navLinkClass}>
              Trang chu
            </NavLink>
            <NavLink to={PATHS.PRODUCTS} className={navLinkClass}>
              San pham
            </NavLink>
            <NavLink to={PATHS.ABOUT} className={navLinkClass}>
              Ve chung toi
            </NavLink>
            <NavLink to={PATHS.CONTACT} className={navLinkClass}>
              Lien he
            </NavLink>
            {isAdmin && (
              <NavLink to={PATHS.ADMIN} className={navLinkClass}>
                Quan tri
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to={PATHS.PROFILE} className="text-sm text-slate-600 hover:text-slate-900">
                  {user.name}
                </Link>
                <Button size="sm" variant="secondary" onClick={logout}>
                  Dang xuat
                </Button>
              </>
            ) : (
              <>
                <Link to={PATHS.LOGIN} className="text-sm text-slate-600 hover:text-slate-900">
                  Dang nhap
                </Link>
                <Link to={PATHS.REGISTER}>
                  <Button size="sm">Dang ky</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-500">
          © {new Date().getFullYear()} {env.APP_NAME}. Source base fullstack.
        </div>
      </footer>
    </div>
  );
}
