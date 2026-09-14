/**
 * Doc bien moi truong cua Vite mot cach TAP TRUNG.
 *
 * Vi sao khong dung thang `import.meta.env.X` khap noi?
 * - Mot cho duy nhat de dat gia tri mac dinh va ep kieu.
 * - De gia lap (mock) khi viet test.
 * - Tim duoc ngay moi bien dang su dung.
 *
 * LUU Y: moi bien VITE_* deu CONG KHAI trong bundle - khong dat secret o day.
 */
const raw = import.meta.env ?? {};

const toBoolean = (value, fallback = false) => {
  if (value === undefined || value === "") return fallback;
  return value === "true" || value === true || value === "1";
};

export const env = {
  API_BASE_URL: raw.VITE_API_BASE_URL || "/api/v1",
  API_TIMEOUT: Number(raw.VITE_API_TIMEOUT) || 15_000,
  APP_NAME: raw.VITE_APP_NAME || "Source Base",

  ENABLE_QUERY_DEVTOOLS: toBoolean(raw.VITE_ENABLE_QUERY_DEVTOOLS, false),
  ENABLE_GOOGLE_LOGIN: toBoolean(raw.VITE_ENABLE_GOOGLE_LOGIN, false),
  ENABLE_MAGIC_LINK: toBoolean(raw.VITE_ENABLE_MAGIC_LINK, true),

  IS_DEV: Boolean(raw.DEV),
  IS_PROD: Boolean(raw.PROD),
};
