import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Alert } from "@/core/components/ui/Alert.jsx";
import { Spinner } from "@/core/components/ui/Spinner.jsx";
import { PATHS } from "@/core/router/paths.js";
import { useAuthActions } from "../useAuthActions.js";

/**
 * Trang nhan magic link: doc ?token= tren URL roi doi lay phien dang nhap.
 *
 * `useRef` chan viec goi 2 lan trong StrictMode - quan trong vi token
 * chi dung duoc DUNG MOT LAN, goi lan hai se that bai.
 */
export default function MagicLinkCallbackPage() {
  const [searchParams] = useSearchParams();
  const { verifyMagicLink } = useAuthActions();
  const token = searchParams.get("token");

  /**
   * Truong hop "thieu token" duoc suy ra NGAY luc render tu URL,
   * khong goi setState trong effect -> tranh mot lan render thua.
   */
  const [status, setStatus] = useState(() => (token ? "verifying" : "error"));
  const [message, setMessage] = useState(() =>
    token ? "" : "Lien ket khong hop le: thieu token.",
  );
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!token || hasVerified.current) return;
    hasVerified.current = true;

    verifyMagicLink(token).then(({ success, error }) => {
      if (!success) {
        setStatus("error");
        setMessage(error?.message ?? "Lien ket da het han hoac da duoc su dung.");
      }
      // Thanh cong: useAuthActions da tu dieu huong ve trang chu
    });
  }, [token, verifyMagicLink]);

  if (status === "verifying") {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-4">
        <Spinner />
        <p className="text-sm text-slate-600">Dang xac minh lien ket dang nhap...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Alert type="error" title="Khong dang nhap duoc">
        {message}
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
