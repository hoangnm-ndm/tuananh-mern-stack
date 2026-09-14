/**
 * Noi luu ACCESS TOKEN o phia client.
 *
 * Quyet dinh thiet ke: luu trong BIEN JAVASCRIPT (bo nho), KHONG dung localStorage.
 * - localStorage bi doc duoc boi bat ky script nao -> mot lo hong XSS la mat token.
 * - Giu trong bo nho thi token bien mat khi tai lai trang, nhung khong sao:
 *   refresh token nam trong cookie httpOnly se tu dong cap lai access token moi
 *   (xem `restoreSession` trong AuthProvider).
 *
 * Doi lai: an toan hon dang ke, va van giu duoc trai nghiem "dang nhap mot lan".
 */
let accessToken = null;

/** Cac ham duoc goi khi token thay doi - de axios interceptor luon dung ban moi nhat. */
const subscribers = new Set();

export const tokenStorage = {
  get() {
    return accessToken;
  },

  set(token) {
    accessToken = token ?? null;
    subscribers.forEach((callback) => callback(accessToken));
  },

  clear() {
    this.set(null);
  },

  /** Dang ky lang nghe thay doi. Tra ve ham huy dang ky. */
  subscribe(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },
};
