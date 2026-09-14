import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { clearDatabase, startTestDatabase, stopTestDatabase } from "../helpers/db.js";
import {
  API,
  TEST_PASSWORD,
  auth,
  createClient,
  createUser,
  createUserAndLogin,
  extractRefreshCookie,
} from "../helpers/app.js";
import { Token } from "../../src/modules/auth/token.model.js";
import { TOKEN_TYPES } from "../../src/core/constants/auth.js";

describe("Xac thuc (authentication)", () => {
  let client;

  beforeAll(async () => {
    await startTestDatabase();
    client = createClient();
  });
  afterEach(async () => clearDatabase());
  afterAll(async () => stopTestDatabase());

  const validRegistration = {
    email: "newuser@example.com",
    password: TEST_PASSWORD,
    confirmPassword: TEST_PASSWORD,
    name: "Nguoi Dung Moi",
  };

  // =========================================================================
  describe("Phuong thuc 1: Email + mat khau", () => {
    it("dang ky thanh cong tra ve 201, access token va cookie refresh", async () => {
      const response = await client
        .post(`${API}/auth/register`)
        .send(validRegistration)
        .expect(201);

      expect(response.body.data.accessToken).toBeTruthy();
      expect(response.body.data.user.email).toBe("newuser@example.com");
      expect(response.body.data.user.role).toBe("member");
      expect(extractRefreshCookie(response)).toBeTruthy();
    });

    it("KHONG BAO GIO tra ve mat khau trong response", async () => {
      const response = await client.post(`${API}/auth/register`).send(validRegistration);
      expect(response.body.data.user).not.toHaveProperty("password");
      expect(JSON.stringify(response.body)).not.toContain(TEST_PASSWORD);
    });

    it("cookie refresh phai la httpOnly", async () => {
      const response = await client.post(`${API}/auth/register`).send(validRegistration);
      const cookie = response.headers["set-cookie"].find((c) => c.startsWith("refresh_token="));
      expect(cookie.toLowerCase()).toContain("httponly");
    });

    it("dang ky trung email -> 409", async () => {
      await createUser({ email: validRegistration.email });
      const response = await client
        .post(`${API}/auth/register`)
        .send(validRegistration)
        .expect(409);
      expect(response.body.errorCode).toBe("EMAIL_ALREADY_EXISTS");
    });

    it("mat khau yeu -> 422 kem chi tiet tung truong", async () => {
      const response = await client
        .post(`${API}/auth/register`)
        .send({ ...validRegistration, password: "yeu", confirmPassword: "yeu" })
        .expect(422);

      expect(response.body.errorCode).toBe("VALIDATION_ERROR");
      expect(response.body.details.some((d) => d.field === "body.password")).toBe(true);
    });

    it("dang nhap dung mat khau -> 200", async () => {
      const user = await createUser();
      const response = await client
        .post(`${API}/auth/login`)
        .send({ email: user.email, password: TEST_PASSWORD })
        .expect(200);

      expect(response.body.data.accessToken).toBeTruthy();
      expect(response.body.data.expiresIn).toBeGreaterThan(0);
    });

    it("sai mat khau va email khong ton tai tra ve CUNG mot thong bao", async () => {
      const user = await createUser();

      const wrongPassword = await client
        .post(`${API}/auth/login`)
        .send({ email: user.email, password: "SaiMatKhau123" })
        .expect(401);

      const noSuchEmail = await client
        .post(`${API}/auth/login`)
        .send({ email: "khongcoai@example.com", password: TEST_PASSWORD })
        .expect(401);

      // Khong de lo email nao da dang ky (chong user enumeration)
      expect(wrongPassword.body.message).toBe(noSuchEmail.body.message);
      expect(wrongPassword.body.errorCode).toBe("INVALID_CREDENTIALS");
    });

    it("tai khoan bi khoa khong dang nhap duoc", async () => {
      const user = await createUser({ isActive: false });
      const response = await client
        .post(`${API}/auth/login`)
        .send({ email: user.email, password: TEST_PASSWORD })
        .expect(403);
      expect(response.body.message).toMatch(/vo hieu hoa/i);
    });

    it("email duoc chuan hoa ve chu thuong khi dang nhap", async () => {
      const user = await createUser({ email: "mixedcase@example.com" });
      await client
        .post(`${API}/auth/login`)
        .send({ email: "MixedCase@Example.COM", password: TEST_PASSWORD })
        .expect(200);
      expect(user.email).toBe("mixedcase@example.com");
    });
  });

  // =========================================================================
  describe("Phuong thuc 3: Magic link", () => {
    it("yeu cau magic link luon tra ve 200 du email co ton tai hay khong", async () => {
      const existing = await createUser({ email: "cothat@example.com" });

      const a = await client
        .post(`${API}/auth/magic-link`)
        .send({ email: existing.email })
        .expect(200);
      const b = await client
        .post(`${API}/auth/magic-link`)
        .send({ email: "khongcoai@example.com" })
        .expect(200);

      expect(a.body.message).toBe(b.body.message);
    });

    it("luu token duoi dang HASH, khong luu ban ro", async () => {
      const response = await client.post(`${API}/auth/magic-link`).send({ email: "a@example.com" });
      const rawToken = response.body.data.devToken;

      const record = await Token.findOne({ type: TOKEN_TYPES.MAGIC_LINK });
      expect(record).toBeTruthy();
      expect(record.tokenHash).not.toBe(rawToken);
      expect(record.tokenHash).toHaveLength(64);
    });

    it("xac minh token hop le -> dang nhap thanh cong", async () => {
      const requested = await client
        .post(`${API}/auth/magic-link`)
        .send({ email: "ml@example.com" });
      const token = requested.body.data.devToken;

      const response = await client
        .post(`${API}/auth/magic-link/verify`)
        .send({ token })
        .expect(200);

      expect(response.body.data.accessToken).toBeTruthy();
      expect(response.body.data.user.email).toBe("ml@example.com");
      // Nhan duoc mail dong nghia kiem soat hop thu -> email coi nhu da xac minh
      expect(response.body.data.user.isEmailVerified).toBe(true);
    });

    it("token chi dung duoc DUNG MOT LAN", async () => {
      const requested = await client
        .post(`${API}/auth/magic-link`)
        .send({ email: "1lan@example.com" });
      const token = requested.body.data.devToken;

      await client.post(`${API}/auth/magic-link/verify`).send({ token }).expect(200);

      const second = await client.post(`${API}/auth/magic-link/verify`).send({ token }).expect(401);
      expect(second.body.errorCode).toBe("MAGIC_LINK_INVALID");
    });

    it("token gia -> 401", async () => {
      const response = await client
        .post(`${API}/auth/magic-link/verify`)
        .send({ token: "a".repeat(43) })
        .expect(401);
      expect(response.body.errorCode).toBe("MAGIC_LINK_INVALID");
    });

    it("token qua ngan bi chan tu tang validate (422)", async () => {
      await client.post(`${API}/auth/magic-link/verify`).send({ token: "ngan" }).expect(422);
    });
  });

  // =========================================================================
  describe("Phuong thuc 2: Google OAuth", () => {
    it("tra ve 400 khi tinh nang dang tat", async () => {
      const response = await client.get(`${API}/auth/google`).expect(400);
      expect(response.body.message).toMatch(/dang tat/i);
    });

    it("callback khong co code -> chuyen huong ve trang dang nhap kem loi", async () => {
      const response = await client.get(`${API}/auth/google/callback`).expect(302);
      expect(response.headers.location).toContain("/dang-nhap?error=missing_code");
    });

    it("callback co code nhung sai state -> 401 (chong CSRF)", async () => {
      const response = await client
        .get(`${API}/auth/google/callback?code=abc&state=state-gia`)
        .expect(401);
      expect(response.body.errorCode).toBe("OAUTH_FAILED");
    });
  });

  // =========================================================================
  describe("Vong doi phien: refresh / logout", () => {
    it("refresh cap access token moi va THU HOI refresh token cu", async () => {
      const { refreshCookie } = await createUserAndLogin(client);

      const first = await client
        .post(`${API}/auth/refresh`)
        .set("Cookie", refreshCookie)
        .expect(200);
      expect(first.body.data.accessToken).toBeTruthy();

      // Dung lai refresh token cu -> phai that bai (token rotation)
      const reuse = await client
        .post(`${API}/auth/refresh`)
        .set("Cookie", refreshCookie)
        .expect(401);
      expect(reuse.body.errorCode).toBe("TOKEN_INVALID");
    });

    it("thieu refresh token -> 401", async () => {
      const response = await client.post(`${API}/auth/refresh`).send({}).expect(401);
      expect(response.body.errorCode).toBe("UNAUTHENTICATED");
    });

    it("khong the dung access token de refresh", async () => {
      const { accessToken } = await createUserAndLogin(client);
      await client.post(`${API}/auth/refresh`).send({ refreshToken: accessToken }).expect(401);
    });

    it("logout thu hoi refresh token va xoa cookie", async () => {
      const { refreshCookie } = await createUserAndLogin(client);

      await client.post(`${API}/auth/logout`).set("Cookie", refreshCookie).expect(200);
      await client.post(`${API}/auth/refresh`).set("Cookie", refreshCookie).expect(401);
    });

    it("logout-all thu hoi token cua MOI thiet bi", async () => {
      const user = await createUser();
      const login = () =>
        client.post(`${API}/auth/login`).send({ email: user.email, password: TEST_PASSWORD });

      const device1 = await login();
      const device2 = await login();

      await client
        .post(`${API}/auth/logout-all`)
        .set(auth(device1.body.data.accessToken))
        .expect(200);

      await client
        .post(`${API}/auth/refresh`)
        .set("Cookie", extractRefreshCookie(device1))
        .expect(401);
      await client
        .post(`${API}/auth/refresh`)
        .set("Cookie", extractRefreshCookie(device2))
        .expect(401);
    });
  });

  // =========================================================================
  describe("GET /auth/me", () => {
    it("tra ve thong tin nguoi dung kem danh sach quyen", async () => {
      const { accessToken } = await createUserAndLogin(client, { role: "admin" });

      const response = await client.get(`${API}/auth/me`).set(auth(accessToken)).expect(200);

      expect(response.body.data.role).toBe("admin");
      expect(response.body.data.permissions).toContain("product:create");
      expect(response.body.data).not.toHaveProperty("password");
    });

    it.each([
      ["thieu header", undefined, "UNAUTHENTICATED"],
      ["token rac", "Bearer token-rac", "TOKEN_INVALID"],
      ["sai scheme", "Basic abc", "UNAUTHENTICATED"],
    ])("%s -> 401 (%s)", async (_label, header, expectedCode) => {
      const req = client.get(`${API}/auth/me`);
      if (header) req.set("Authorization", header);
      const response = await req.expect(401);
      expect(response.body.errorCode).toBe(expectedCode);
    });

    it("tai khoan bi khoa SAU khi cap token -> bi chan ngay", async () => {
      const { user, accessToken } = await createUserAndLogin(client);

      user.isActive = false;
      await user.save();

      // Trang thai duoc doc lai tu DB moi request -> khong cho token cu song sot
      await client.get(`${API}/auth/me`).set(auth(accessToken)).expect(403);
    });
  });
});
