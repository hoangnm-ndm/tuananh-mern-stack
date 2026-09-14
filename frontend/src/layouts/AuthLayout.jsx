import { Link, Outlet } from "react-router";
import { PATHS } from "@/core/router/paths.js";
import { env } from "@/core/config/env.js";

/** Bo cuc toi gian cho cac trang dang nhap / dang ky / callback. */
export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <Link to={PATHS.HOME} className="mb-8 text-xl font-bold text-slate-900">
        {env.APP_NAME}
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Outlet />
      </div>
    </div>
  );
}
