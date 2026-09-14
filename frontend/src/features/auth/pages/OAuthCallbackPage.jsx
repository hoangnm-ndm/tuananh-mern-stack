import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Alert } from "@/core/components/ui/Alert.jsx";
import { Spinner } from "@/core/components/ui/Spinner.jsx";
import { useAuth } from "@/core/auth/useAuth.js";
import { tokenStorage } from "@/core/auth/tokenStorage.js";
import { PATHS } from "@/core/router/paths.js";
import { authApi } from "../auth.api.js";

/**
 * Trang trung gian sau khi Google chuyen huong ve.
 *
 * Backend da dat cookie refresh token va dinh kem access token tren URL.
 * Ta lay token vao bo nho, XOA khoi thanh dia chi (de token khong nam trong
 * lich su trinh duyet), roi lay ho so nguoi dung.
 */
export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser } = useAuth();

  const accessToken = searchParams.get("accessToken");
  const oauthError = searchParams.get("error");

  /** Loi doc thang tu URL -> suy ra luc render, khong setState trong effect. */
  const [error, setError] = useState(() =>
    oauthError || !accessToken ? (oauthError ?? "Khong nhan duoc token tu nha cung cap.") : null,
  );
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current || !accessToken || oauthError) return;
    hasProcessed.current = true;

    tokenStorage.set(accessToken);
    // Xoa token khoi URL ngay lap tuc
    window.history.replaceState({}, "", PATHS.OAUTH_CALLBACK);

    authApi
      .me()
      .then(async (response) => {
        setUser(response.data);
        await queryClient.invalidateQueries();
        navigate(PATHS.HOME, { replace: true });
      })
      .catch((apiError) => {
        tokenStorage.clear();
        setError(apiError.message);
      });
  }, [accessToken, oauthError, navigate, queryClient, setUser]);

  if (error) {
    return (
      <div className="w-full max-w-md">
        <Alert type="error" title="Dang nhap that bai">
          {error}
        </Alert>
        <Link
          to={PATHS.LOGIN}
          className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline"
        >
          ← Quay lai trang dang nhap
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <Spinner />
      <p className="text-sm text-slate-600">Dang hoan tat dang nhap...</p>
    </div>
  );
}
