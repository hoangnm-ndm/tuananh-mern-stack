import axios from "axios";
import { env } from "../config/env.js";
import { tokenStorage } from "../auth/tokenStorage.js";
import { normalizeAxiosError } from "./apiError.js";

/**
 * Client HTTP dung chung.
 *
 * Hai interceptor lam toan bo viec nang nhoc:
 *  - REQUEST : tu gan `Authorization: Bearer <access token>`
 *  - RESPONSE: (1) boc tach `response.data` -> code goi khong phai viet `.data.data`
 *              (2) gap 401 thi TU DONG goi /auth/refresh roi chay lai request cu
 *              (3) chuan hoa moi loi thanh ApiError
 *
 * Nho vay tang `features/` chi viet dung logic nghiep vu.
 */
export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: env.API_TIMEOUT,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // bat buoc de trinh duyet gui cookie refresh token
});

// ---------------------------------------------------------------------------
// Interceptor REQUEST
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---------------------------------------------------------------------------
// Tu dong lam moi token khi gap 401
// ---------------------------------------------------------------------------

/**
 * Khi nhieu request cung bi 401 mot luc, ta chi goi /auth/refresh DUNG MOT LAN
 * roi cho tat ca cung cho ket qua. Neu khong se co "bao refresh" gui song song.
 */
let refreshPromise = null;

/** Cac ham duoc goi khi lam moi that bai -> AuthProvider dung de dang xuat. */
const sessionExpiredHandlers = new Set();

export function onSessionExpired(handler) {
  sessionExpiredHandlers.add(handler);
  return () => sessionExpiredHandlers.delete(handler);
}

/** Duong dan KHONG duoc thu lam moi (tranh vong lap vo tan). */
const NO_RETRY_PATHS = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/magic-link"];

async function refreshAccessToken() {
  // Dung instance axios RIENG de khong bi chinh interceptor nay bat lai
  const response = await axios.post(
    `${env.API_BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true, timeout: env.API_TIMEOUT },
  );
  const accessToken = response.data?.data?.accessToken;
  if (!accessToken) throw new Error("Phan hoi refresh khong co accessToken");
  tokenStorage.set(accessToken);
  return accessToken;
}

apiClient.interceptors.response.use(
  // Thanh cong: tra thang phan `data` cua body -> code goi gon hon
  (response) => response.data,

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url ?? "";

    const shouldTryRefresh =
      status === 401 &&
      originalRequest &&
      !originalRequest._isRetry &&
      !NO_RETRY_PATHS.some((path) => url.includes(path));

    if (shouldTryRefresh) {
      originalRequest._isRetry = true;

      try {
        refreshPromise = refreshPromise ?? refreshAccessToken();
        const newToken = await refreshPromise;
        refreshPromise = null;

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest); // chay lai request ban dau
      } catch {
        refreshPromise = null;
        tokenStorage.clear();
        sessionExpiredHandlers.forEach((handler) => handler());
      }
    }

    return Promise.reject(normalizeAxiosError(error));
  },
);

/** Duong tat cho cac dong tac HTTP thuong dung. */
export const http = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
};
