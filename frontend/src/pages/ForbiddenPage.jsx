import { Link } from "react-router";
import { Button } from "@/core/components/ui/Button.jsx";
import { useAuth } from "@/core/auth/useAuth.js";
import { ROLE_LABELS } from "@/core/config/constants.js";
import { PATHS } from "@/core/router/paths.js";

export default function ForbiddenPage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl font-bold text-slate-300">403</p>
      <h1 className="text-2xl font-bold text-slate-900">Ban khong co quyen truy cap</h1>
      <p className="max-w-md text-slate-600">
        Vai tro hien tai cua ban la <strong>{ROLE_LABELS[user?.role] ?? "khach"}</strong>, chua du
        quyen de xem trang nay. Lien he quan tri vien neu ban nghi day la nham lan.
      </p>
      <Link to={PATHS.HOME}>
        <Button>Ve trang chu</Button>
      </Link>
    </div>
  );
}
