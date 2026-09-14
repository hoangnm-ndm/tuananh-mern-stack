import { Button } from "@/core/components/ui/Button.jsx";
import { env } from "@/core/config/env.js";

/**
 * Cac nut dang nhap bang nha cung cap ngoai.
 * Chi hien khi feature flag duoc bat -> phai KHOP voi cau hinh backend.
 */
export function SocialLoginButtons({ onGoogleLogin, isSubmitting }) {
  if (!env.ENABLE_GOOGLE_LOGIN) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-xs uppercase tracking-wide text-slate-400">hoac</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <Button variant="outline" onClick={onGoogleLogin} isLoading={isSubmitting} className="w-full">
        <GoogleIcon />
        Dang nhap voi Google
      </Button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 010-4.22V7.05H2.18a11 11 0 000 9.9l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 002.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
