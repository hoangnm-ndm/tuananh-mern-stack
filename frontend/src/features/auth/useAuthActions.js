import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/core/auth/useAuth.js";
import { useToast } from "@/core/hooks/useToast.js";
import { PATHS } from "@/core/router/paths.js";
import { authApi } from "./auth.api.js";

/**
 * CUSTOM HOOK cho toan bo hanh dong xac thuc.
 *
 * Vi sao gom vao MOT hook?
 * Ca 4 luong (dang ky, dang nhap, Google, magic link) deu ket thuc giong het nhau:
 *   luu phien -> xoa cache cu -> bao thanh cong -> dieu huong ve trang truoc do.
 * Gom lai giup logic nay chi ton tai o MOT noi; trang chi lo phan giao dien.
 *
 * Loi validate tu backend duoc doi sang dang react-hook-form (xem `ApiError.toFormErrors`)
 * -> bao loi hien dung ngay duoi tung o nhap.
 *
 * @example
 * const { login, isSubmitting, serverError } = useAuthActions();
 * const onSubmit = (values) => login(values, { setError });
 */
export function useAuthActions() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { applySession, clearSession } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  /** Duong ve sau khi dang nhap: uu tien trang nguoi dung dinh vao truoc do. */
  const redirectAfterLogin = useCallback(
    (fallback = PATHS.HOME) => {
      const from = window.history.state?.usr?.from?.pathname;
      navigate(from ?? fallback, { replace: true });
    },
    [navigate],
  );

  /**
   * Boc chung cho moi hanh dong: bat/tat trang thai gui, dich loi, hien thong bao.
   * @param {Function} action Ham async thuc hien goi API.
   * @param {object} options
   * @param {Function} [options.setError] Ham setError cua react-hook-form.
   */
  const run = useCallback(
    async (action, { setError, successMessage } = {}) => {
      setIsSubmitting(true);
      setServerError(null);

      try {
        const result = await action();
        if (successMessage) toast.success(successMessage);
        return { success: true, result };
      } catch (error) {
        // Loi validate -> gan vao dung o nhap tuong ung
        if (error.isValidationError && setError) {
          const fieldErrors = error.toFormErrors();
          for (const [field, message] of Object.entries(fieldErrors)) {
            setError(field, { type: "server", message });
          }
          if (Object.keys(fieldErrors).length > 0) {
            return { success: false, error };
          }
        }

        // Cac loi con lai -> hien o dau form
        setServerError(error.message);
        return { success: false, error };
      } finally {
        setIsSubmitting(false);
      }
    },
    [toast],
  );

  const login = useCallback(
    (values, options) =>
      run(
        async () => {
          const response = await authApi.login(values);
          applySession(response.data);
          await queryClient.invalidateQueries();
          redirectAfterLogin();
          return response.data;
        },
        { ...options, successMessage: "Dang nhap thanh cong" },
      ),
    [run, applySession, queryClient, redirectAfterLogin],
  );

  const register = useCallback(
    (values, options) =>
      run(
        async () => {
          const { confirmPassword, ...rest } = values;
          const response = await authApi.register({ ...rest, confirmPassword });
          applySession(response.data);
          await queryClient.invalidateQueries();
          redirectAfterLogin();
          return response.data;
        },
        { ...options, successMessage: "Dang ky thanh cong" },
      ),
    [run, applySession, queryClient, redirectAfterLogin],
  );

  /** Google: lay URL roi chuyen huong ca trang (khong phai SPA navigation). */
  const loginWithGoogle = useCallback(
    () =>
      run(async () => {
        const response = await authApi.getGoogleAuthUrl();
        window.location.href = response.data.url;
      }),
    [run],
  );

  const requestMagicLink = useCallback(
    (values, options) =>
      run(async () => {
        const response = await authApi.requestMagicLink(values);
        toast.success(response.message);
        return response.data;
      }, options),
    [run, toast],
  );

  const verifyMagicLink = useCallback(
    (token) =>
      run(
        async () => {
          const response = await authApi.verifyMagicLink({ token });
          applySession(response.data);
          await queryClient.invalidateQueries();
          navigate(PATHS.HOME, { replace: true });
          return response.data;
        },
        { successMessage: "Dang nhap thanh cong" },
      ),
    [run, applySession, queryClient, navigate],
  );

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    clearSession();
    queryClient.clear();
    toast.info("Da dang xuat");
    navigate(PATHS.LOGIN, { replace: true });
  }, [clearSession, queryClient, toast, navigate]);

  return {
    login,
    register,
    loginWithGoogle,
    requestMagicLink,
    verifyMagicLink,
    logout,
    isSubmitting,
    serverError,
    clearServerError: () => setServerError(null),
  };
}
