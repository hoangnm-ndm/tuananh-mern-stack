import { Link } from "react-router";
import { Button } from "@/core/components/ui/Button.jsx";
import { PATHS } from "@/core/router/paths.js";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl font-bold text-slate-300">404</p>
      <h1 className="text-2xl font-bold text-slate-900">Khong tim thay trang</h1>
      <p className="max-w-md text-slate-600">
        Trang ban tim co the da bi xoa, doi ten hoac tam thoi khong truy cap duoc.
      </p>
      <Link to={PATHS.HOME}>
        <Button>Ve trang chu</Button>
      </Link>
    </div>
  );
}
