import "dotenv/config";
import { z } from "zod";

/**
 * Validate bien moi truong NGAY KHI khoi dong (fail-fast).
 * Neu thieu/sai bien -> app dung ngay voi thong bao ro rang, thay vi loi mo ho luc runtime.
 *
 * Quy uoc:
 * - REQUIRED: khong co gia tri mac dinh -> bat buoc khai bao trong .env.
 * - OPTIONAL: co .default() hoac .optional() -> co the bo trong.
 * - Cac bien cua tinh nang chua bat (Redis/R2/SMTP) la optional, nhung neu BAT tinh nang
 *   thi bi rang buoc boi .superRefine() o cuoi file.
 */

const booleanFromString = z
  .union([z.boolean(), z.enum(["true", "false", "1", "0"])])
  .transform((value) => value === true || value === "true" || value === "1");

const envSchema = z
  .object({
    // ---------- Ung dung ----------
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    /** 0 = de he dieu hanh cap cong ngau nhien (dung khi chay test). */
    PORT: z.coerce.number().int().min(0).max(65535).default(8000),
    APP_NAME: z.string().min(1).default("Source Base API"),
    API_PREFIX: z.string().startsWith("/").default("/api/v1"),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error", "silent"]).default("info"),

    // ---------- URL cong khai ----------
    APP_URL: z.url().default("http://localhost:8000"),
    CLIENT_URL: z.url().default("http://localhost:5173"),
    /** Danh sach origin duoc CORS cho phep, phan cach bang dau phay. */
    CORS_ORIGINS: z.string().default("http://localhost:5173"),

    // ---------- Co so du lieu ----------
    DB_URI: z.string().min(1, "DB_URI la bat buoc (chuoi ket noi MongoDB)"),
    DB_NAME: z.string().optional(),

    // ---------- JWT ----------
    JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET phai dai it nhat 32 ky tu"),
    JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET phai dai it nhat 32 ky tu"),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
    JWT_ISSUER: z.string().default("source-base"),

    // ---------- Cookie ----------
    COOKIE_DOMAIN: z.string().optional(),
    COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),

    // ---------- Bao mat ----------
    BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),
    RATE_LIMIT_WINDOW_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(15 * 60 * 1000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),

    // ---------- Google OAuth ----------
    GOOGLE_OAUTH_ENABLED: booleanFromString.default(false),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CALLBACK_URL: z.url().optional(),

    // ---------- Magic link ----------
    MAGIC_LINK_ENABLED: booleanFromString.default(true),
    MAGIC_LINK_EXPIRES_IN: z.string().default("15m"),
    MAGIC_LINK_REDIRECT_PATH: z.string().startsWith("/").default("/auth/magic-link/callback"),

    // ---------- Mail (Phase 2) ----------
    MAIL_DRIVER: z.enum(["console", "smtp", "resend"]).default("console"),
    MAIL_FROM: z.string().default("no-reply@example.com"),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),

    // ---------- Cache / Redis (Phase 3) ----------
    CACHE_DRIVER: z.enum(["memory", "redis"]).default("memory"),
    REDIS_URL: z.string().optional(),
    CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(300),

    // ---------- Luu tru file - Cloudflare R2 (Phase 4) ----------
    STORAGE_DRIVER: z.enum(["local", "r2"]).default("local"),
    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_BUCKET: z.string().optional(),
    R2_PUBLIC_URL: z.url().optional(),
    MAX_UPLOAD_SIZE_MB: z.coerce.number().positive().default(5),

    // ---------- Cron jobs (Phase 5) ----------
    CRON_ENABLED: booleanFromString.default(false),
    CRON_TIMEZONE: z.string().default("Asia/Ho_Chi_Minh"),

    // ---------- Tai khoan quan tri khoi tao (seed) ----------
    SEED_SUPER_ADMIN_EMAIL: z.email().default("superadmin@example.com"),
    SEED_SUPER_ADMIN_PASSWORD: z.string().min(8).default("SuperAdmin@123"),
  })
  .superRefine((env, ctx) => {
    const requireWhen = (condition, keys, hint) => {
      if (!condition) return;
      for (const key of keys) {
        if (!env[key]) {
          ctx.addIssue({ code: "custom", path: [key], message: `${key} la bat buoc khi ${hint}` });
        }
      }
    };

    requireWhen(
      env.GOOGLE_OAUTH_ENABLED,
      ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_CALLBACK_URL"],
      "GOOGLE_OAUTH_ENABLED=true",
    );
    requireWhen(
      env.MAIL_DRIVER === "smtp",
      ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD"],
      'MAIL_DRIVER="smtp"',
    );
    requireWhen(env.MAIL_DRIVER === "resend", ["RESEND_API_KEY"], 'MAIL_DRIVER="resend"');
    requireWhen(env.CACHE_DRIVER === "redis", ["REDIS_URL"], 'CACHE_DRIVER="redis"');
    requireWhen(
      env.STORAGE_DRIVER === "r2",
      ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"],
      'STORAGE_DRIVER="r2"',
    );

    if (env.NODE_ENV === "production" && env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
      ctx.addIssue({
        code: "custom",
        path: ["JWT_REFRESH_SECRET"],
        message: "JWT_REFRESH_SECRET phai khac JWT_ACCESS_SECRET o moi truong production",
      });
    }
  });

/**
 * Trong file .env, `KEY=` (de trong) nghia la "chua cau hinh".
 * Neu giu nguyen chuoi rong, cac schema nhu z.url() se bao loi oan,
 * va .default() cung khong duoc ap dung. Vi vay ta quy doi "" -> undefined truoc khi validate.
 */
function normalizeEmptyStrings(source) {
  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [
      key,
      typeof value === "string" && value.trim() === "" ? undefined : value,
    ]),
  );
}

/**
 * Doc + validate env. Tach thanh ham de test co the truyen source gia lap.
 * @param {NodeJS.ProcessEnv} source
 */
export function loadEnv(source = process.env) {
  const result = envSchema.safeParse(normalizeEmptyStrings(source));

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Cau hinh moi truong khong hop le:\n${details}\n\nGoi y: chay "npm run env:sync" roi dien .env`,
    );
  }

  const parsed = result.data;

  return Object.freeze({
    ...parsed,
    isProduction: parsed.NODE_ENV === "production",
    isDevelopment: parsed.NODE_ENV === "development",
    isTest: parsed.NODE_ENV === "test",
    corsOrigins: parsed.CORS_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  });
}

/** Instance dung chung toan app. */
export const env = loadEnv();
export { envSchema };
