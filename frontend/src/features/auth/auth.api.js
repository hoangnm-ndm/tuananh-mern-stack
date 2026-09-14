import { http } from "@/core/api/client.js";

/**
 * Lop goi API cua module xac thuc.
 * Chi lam MOT viec: goi HTTP va tra du lieu. Khong chua state, khong dung hook.
 * Nho vay test duoc doc lap va tai su dung duoc o bat ky dau.
 */
export const authApi = {
  register: (payload) => http.post("/auth/register", payload),
  login: (payload) => http.post("/auth/login", payload),
  logout: () => http.post("/auth/logout"),
  logoutAll: () => http.post("/auth/logout-all"),
  refresh: () => http.post("/auth/refresh"),
  me: () => http.get("/auth/me"),

  /** Lay URL dong y cua Google (them ?json=1 de nhan JSON thay vi bi chuyen huong). */
  getGoogleAuthUrl: () => http.get("/auth/google?json=1"),

  requestMagicLink: (payload) => http.post("/auth/magic-link", payload),
  verifyMagicLink: (payload) => http.post("/auth/magic-link/verify", payload),

  changePassword: (payload) => http.post("/users/me/change-password", payload),
  updateProfile: (payload) => http.patch("/users/me", payload),
};
