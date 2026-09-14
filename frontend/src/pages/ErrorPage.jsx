import { Link, useRouteError } from "react-router";
import { Button } from "@/core/components/ui/Button.jsx";
import { PATHS } from "@/core/router/paths.js";

/**
 * Trang bat loi cua router (errorElement).
 * Bat moi loi khong duoc xu ly khi render -> nguoi dung khong bao gio thay man hinh trang.
 */
export default function ErrorPage() {
  const error = useRouteError();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Da co loi xay ra</h1>
      <p className="max-w-md text-slate-600">
        {error?.message ?? "Ung dung gap su co khong mong muon."}
      </p>

      {import.meta.env.DEV && error?.stack && (
        <pre className="max-w-2xl overflow-x-auto rounded-lg bg-slate-900 p-4 text-left text-xs text-slate-100">
          {error.stack}
        </pre>
      )}

      <div className="flex gap-2">
        <Button onClick={() => window.location.reload()}>Tai lai trang</Button>
        <Link to={PATHS.HOME}>
          <Button variant="outline">Ve trang chu</Button>
        </Link>
      </div>
    </div>
  );
}
