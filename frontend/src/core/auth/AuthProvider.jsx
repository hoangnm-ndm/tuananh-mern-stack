import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AuthContext } from "./AuthContext.js";
import { tokenStorage } from "./tokenStorage.js";
import { onSessionExpired } from "../api/client.js";
import { authApi } from "@/features/auth/auth.api.js";

/**
 * Nguon su that duy nhat ve "ai dang dang nhap".
 *
 * Khoi phuc phien khi tai lai trang:
 *   Access token nam trong bo nho nen mat khi F5. Nhung refresh token van con
 *   trong cookie httpOnly -> ta goi /auth/refresh MOT LAN luc khoi dong.
 *   Thanh cong thi lay tiep /auth/me; that bai thi coi nhu chua dang nhap.
 *
 * Trong luc do `isInitializing = true` de router khong "nhap nhay" sang trang dang nhap.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Chan goi khoi phuc 2 lan trong StrictMode (React chay effect 2 luot khi dev)
  const hasRestored = useRef(false);

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  /** Ghi nhan ket qua dang nhap tu bat ky phuong thuc nao (password / Google / magic link). */
  const applySession = useCallback((session) => {
    tokenStorage.set(session.accessToken);
    setUser(session.user);
    return session.user;
  }, []);

  // ---------- Khoi phuc phien khi tai lai trang ----------
  useEffect(() => {
    if (hasRestored.current) return;
    hasRestored.current = true;

    let isMounted = true;

    (async () => {
      try {
        const refreshed = await authApi.refresh();
        tokenStorage.set(refreshed.data.accessToken);

        const profile = await authApi.me();
        if (isMounted) setUser(profile.data);
      } catch {
        // Khong co phien hop le -> nguoi dung chua dang nhap. Day la truong hop BINH THUONG.
        if (isMounted) clearSession();
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [clearSession]);

  // ---------- Khi interceptor bao phien het han ----------
  useEffect(() => onSessionExpired(clearSession), [clearSession]);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {}); // that bai o server cung van dang xuat o client
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      permissions: user?.permissions ?? [],
      applySession,
      clearSession,
      setUser,
      logout,
    }),
    [user, isInitializing, applySession, clearSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
