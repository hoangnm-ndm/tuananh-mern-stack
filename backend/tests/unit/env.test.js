import { describe, expect, it } from "vitest";
import { loadEnv } from "../../src/config/env.js";

/** Tap bien toi thieu de env hop le - moi test se ghi de tung phan. */
const baseEnv = {
  DB_URI: "mongodb://127.0.0.1:27017/test",
  JWT_ACCESS_SECRET: "a".repeat(32),
  JWT_REFRESH_SECRET: "b".repeat(32),
};

describe("loadEnv", () => {
  it("ap gia tri mac dinh cho cac bien khong bat buoc", () => {
    const env = loadEnv(baseEnv);
    expect(env.NODE_ENV).toBe("development");
    expect(env.PORT).toBe(8000);
    expect(env.API_PREFIX).toBe("/api/v1");
    expect(env.JWT_ACCESS_EXPIRES_IN).toBe("15m");
  });

  it("ep kieu chuoi sang so", () => {
    expect(loadEnv({ ...baseEnv, PORT: "3000" }).PORT).toBe(3000);
  });

  it("coi chuoi rong la chua cau hinh", () => {
    expect(() => loadEnv({ ...baseEnv, R2_PUBLIC_URL: "" })).not.toThrow();
    expect(loadEnv({ ...baseEnv, PORT: "" }).PORT).toBe(8000);
  });

  it("thieu bien bat buoc -> nem loi kem ten bien", () => {
    expect(() =>
      loadEnv({ JWT_ACCESS_SECRET: "a".repeat(32), JWT_REFRESH_SECRET: "b".repeat(32) }),
    ).toThrowError(/DB_URI/);
  });

  it("secret qua ngan -> nem loi", () => {
    expect(() => loadEnv({ ...baseEnv, JWT_ACCESS_SECRET: "ngan" })).toThrowError(
      /JWT_ACCESS_SECRET/,
    );
  });

  it("bat Google OAuth ma thieu cau hinh -> nem loi", () => {
    expect(() => loadEnv({ ...baseEnv, GOOGLE_OAUTH_ENABLED: "true" })).toThrowError(
      /GOOGLE_CLIENT_ID/,
    );
  });

  it("bat Google OAuth voi du cau hinh -> hop le", () => {
    const env = loadEnv({
      ...baseEnv,
      GOOGLE_OAUTH_ENABLED: "true",
      GOOGLE_CLIENT_ID: "id",
      GOOGLE_CLIENT_SECRET: "secret",
      GOOGLE_CALLBACK_URL: "http://localhost:8000/api/v1/auth/google/callback",
    });
    expect(env.GOOGLE_OAUTH_ENABLED).toBe(true);
  });

  it("CACHE_DRIVER=redis ma thieu REDIS_URL -> nem loi", () => {
    expect(() => loadEnv({ ...baseEnv, CACHE_DRIVER: "redis" })).toThrowError(/REDIS_URL/);
  });

  it("STORAGE_DRIVER=r2 ma thieu khoa -> nem loi", () => {
    expect(() => loadEnv({ ...baseEnv, STORAGE_DRIVER: "r2" })).toThrowError(/R2_ACCOUNT_ID/);
  });

  it("production KHONG duoc dung chung 1 secret cho access va refresh", () => {
    expect(() =>
      loadEnv({
        ...baseEnv,
        NODE_ENV: "production",
        JWT_REFRESH_SECRET: baseEnv.JWT_ACCESS_SECRET,
      }),
    ).toThrowError(/JWT_REFRESH_SECRET/);
  });

  it("tach CORS_ORIGINS thanh mang va bo khoang trang thua", () => {
    const env = loadEnv({ ...baseEnv, CORS_ORIGINS: "http://a.com, http://b.com ," });
    expect(env.corsOrigins).toEqual(["http://a.com", "http://b.com"]);
  });

  it("dat co tien ich theo NODE_ENV", () => {
    expect(loadEnv({ ...baseEnv, NODE_ENV: "production" }).isProduction).toBe(true);
    expect(loadEnv({ ...baseEnv, NODE_ENV: "test" }).isTest).toBe(true);
  });
});
