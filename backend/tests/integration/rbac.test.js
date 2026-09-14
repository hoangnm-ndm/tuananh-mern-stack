import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { clearDatabase, startTestDatabase, stopTestDatabase } from "../helpers/db.js";
import { API, auth, createClient, createUser, createUserAndLogin } from "../helpers/app.js";
import { ROLES } from "../../src/core/constants/roles.js";

describe("Phan quyen RBAC tren API that", () => {
  let client;

  beforeAll(async () => {
    await startTestDatabase();
    client = createClient();
  });
  afterEach(async () => clearDatabase());
  afterAll(async () => stopTestDatabase());

  describe("GET /users - can quyen user:read", () => {
    it.each([
      [ROLES.MEMBER, 403],
      [ROLES.ADMIN, 200],
      [ROLES.SUPER_ADMIN, 200],
    ])("vai tro %s -> %i", async (role, expectedStatus) => {
      const { accessToken } = await createUserAndLogin(client, { role });
      await client.get(`${API}/users`).set(auth(accessToken)).expect(expectedStatus);
    });

    it("chua dang nhap -> 401", async () => {
      await client.get(`${API}/users`).expect(401);
    });

    it("thong bao 403 noi ro quyen con thieu", async () => {
      const { accessToken } = await createUserAndLogin(client, { role: ROLES.MEMBER });
      const response = await client.get(`${API}/users`).set(auth(accessToken)).expect(403);
      expect(response.body.errorCode).toBe("INSUFFICIENT_PERMISSION");
      expect(response.body.details.requiredPermissions).toContain("user:read");
      expect(response.body.details.currentRole).toBe(ROLES.MEMBER);
    });
  });

  describe("DELETE /users/:id - chi superAdmin", () => {
    it.each([
      [ROLES.MEMBER, 403],
      [ROLES.ADMIN, 403],
      [ROLES.SUPER_ADMIN, 200],
    ])("vai tro %s -> %i", async (role, expectedStatus) => {
      const { accessToken } = await createUserAndLogin(client, { role });
      const target = await createUser();
      await client
        .delete(`${API}/users/${target.id}`)
        .set(auth(accessToken))
        .expect(expectedStatus);
    });
  });

  describe("PATCH /users/:id/role - quy tac an toan", () => {
    it("admin khong duoc doi vai tro (chi superAdmin)", async () => {
      const { accessToken } = await createUserAndLogin(client, { role: ROLES.ADMIN });
      const target = await createUser();
      await client
        .patch(`${API}/users/${target.id}/role`)
        .set(auth(accessToken))
        .send({ role: ROLES.ADMIN })
        .expect(403);
    });

    it("superAdmin nang cap mot member len admin", async () => {
      const { accessToken } = await createUserAndLogin(client, { role: ROLES.SUPER_ADMIN });
      const target = await createUser({ role: ROLES.MEMBER });

      const response = await client
        .patch(`${API}/users/${target.id}/role`)
        .set(auth(accessToken))
        .send({ role: ROLES.ADMIN })
        .expect(200);

      expect(response.body.data.role).toBe(ROLES.ADMIN);
    });

    it("khong ai duoc tu doi vai tro cua chinh minh", async () => {
      const { user, accessToken } = await createUserAndLogin(client, { role: ROLES.SUPER_ADMIN });
      const response = await client
        .patch(`${API}/users/${user.id}/role`)
        .set(auth(accessToken))
        .send({ role: ROLES.MEMBER })
        .expect(403);
      expect(response.body.message).toMatch(/chinh minh/i);
    });

    it("vai tro khong ton tai -> 422", async () => {
      const { accessToken } = await createUserAndLogin(client, { role: ROLES.SUPER_ADMIN });
      const target = await createUser();
      await client
        .patch(`${API}/users/${target.id}/role`)
        .set(auth(accessToken))
        .send({ role: "godmode" })
        .expect(422);
    });
  });

  describe("PATCH /users/:id/status - khoa tai khoan", () => {
    it("admin khoa duoc tai khoan khac", async () => {
      const { accessToken } = await createUserAndLogin(client, { role: ROLES.ADMIN });
      const target = await createUser();

      const response = await client
        .patch(`${API}/users/${target.id}/status`)
        .set(auth(accessToken))
        .send({ isActive: false })
        .expect(200);

      expect(response.body.data.isActive).toBe(false);
    });

    it("khong the tu khoa chinh minh", async () => {
      const { user, accessToken } = await createUserAndLogin(client, { role: ROLES.ADMIN });
      await client
        .patch(`${API}/users/${user.id}/status`)
        .set(auth(accessToken))
        .send({ isActive: false })
        .expect(403);
    });
  });

  describe("Endpoint cua chinh minh - moi vai tro deu dung duoc", () => {
    it("GET /users/me hoat dong voi member", async () => {
      const { user, accessToken } = await createUserAndLogin(client, { role: ROLES.MEMBER });
      const response = await client.get(`${API}/users/me`).set(auth(accessToken)).expect(200);
      expect(response.body.data.email).toBe(user.email);
    });

    it("PATCH /users/me cap nhat duoc ten", async () => {
      const { accessToken } = await createUserAndLogin(client, { role: ROLES.MEMBER });
      const response = await client
        .patch(`${API}/users/me`)
        .set(auth(accessToken))
        .send({ name: "Ten Moi" })
        .expect(200);
      expect(response.body.data.name).toBe("Ten Moi");
    });

    it("PATCH /users/me KHONG cho tu nang vai tro", async () => {
      const { accessToken } = await createUserAndLogin(client, { role: ROLES.MEMBER });
      // `role` khong nam trong updateProfileSchema -> bi loai bo, khong duoc ghi
      const response = await client
        .patch(`${API}/users/me`)
        .set(auth(accessToken))
        .send({ name: "Hacker", role: ROLES.SUPER_ADMIN })
        .expect(200);
      expect(response.body.data.role).toBe(ROLES.MEMBER);
    });

    it("doi mat khau thanh cong roi dang nhap bang mat khau moi", async () => {
      const { user, accessToken } = await createUserAndLogin(client);

      await client
        .post(`${API}/users/me/change-password`)
        .set(auth(accessToken))
        .send({
          currentPassword: "MatKhau123",
          newPassword: "MatKhauMoi456",
          confirmPassword: "MatKhauMoi456",
        })
        .expect(200);

      await client
        .post(`${API}/auth/login`)
        .send({ email: user.email, password: "MatKhauMoi456" })
        .expect(200);
      await client
        .post(`${API}/auth/login`)
        .send({ email: user.email, password: "MatKhau123" })
        .expect(401);
    });

    it("doi mat khau voi mat khau hien tai sai -> 400", async () => {
      const { accessToken } = await createUserAndLogin(client);
      const response = await client
        .post(`${API}/users/me/change-password`)
        .set(auth(accessToken))
        .send({
          currentPassword: "SaiRoi123",
          newPassword: "MatKhauMoi456",
          confirmPassword: "MatKhauMoi456",
        })
        .expect(400);
      expect(response.body.errorCode).toBe("INVALID_CREDENTIALS");
    });
  });
});
