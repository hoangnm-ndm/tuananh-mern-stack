import request from "supertest";
import { createApp } from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { User } from "../../src/modules/user/user.model.js";
import { ROLES } from "../../src/core/constants/roles.js";
import { AUTH_PROVIDERS } from "../../src/core/constants/auth.js";

export const API = env.API_PREFIX;

/** Agent supertest dung chung - giu cookie giua cac request. */
export function createClient() {
  return request(createApp());
}

export const TEST_PASSWORD = "MatKhau123";

/**
 * Tao nguoi dung truc tiep trong DB (bo qua API) de test tap trung vao thu can kiem.
 * Dung `new User().save()` de hook bam mat khau duoc chay.
 */
export async function createUser({
  email = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`,
  password = TEST_PASSWORD,
  name = "Nguoi Dung Test",
  role = ROLES.MEMBER,
  isActive = true,
  isEmailVerified = true,
} = {}) {
  const user = new User({
    email,
    password,
    name,
    role,
    isActive,
    isEmailVerified,
    providers: [{ name: AUTH_PROVIDERS.LOCAL }],
  });
  await user.save();
  return user;
}

/** Tao nguoi dung roi dang nhap, tra ve ca user lan access token. */
export async function createUserAndLogin(client, options = {}) {
  const user = await createUser(options);

  const response = await client
    .post(`${API}/auth/login`)
    .send({ email: user.email, password: options.password ?? TEST_PASSWORD });

  return {
    user,
    accessToken: response.body.data.accessToken,
    refreshCookie: extractRefreshCookie(response),
  };
}

/** Lay cookie refresh token tu response de gui lai o request sau. */
export function extractRefreshCookie(response) {
  const cookies = response.headers["set-cookie"] ?? [];
  return cookies.find((cookie) => cookie.startsWith("refresh_token="))?.split(";")[0] ?? null;
}

/** Duong tat gan header Authorization. */
export function auth(token) {
  return { Authorization: `Bearer ${token}` };
}
