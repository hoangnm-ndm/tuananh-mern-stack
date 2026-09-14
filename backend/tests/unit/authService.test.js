import { describe, expect, it, vi } from "vitest";
import { AuthService } from "../../src/modules/auth/auth.service.js";
import { AppError } from "../../src/core/errors/index.js";
import { AUTH_PROVIDERS, TOKEN_TYPES } from "../../src/core/constants/auth.js";

/**
 * Test AuthService voi TOAN BO dependency duoc gia lap (mock).
 * Nho tiem dependency qua constructor, ta kiem duoc luong Google OAuth
 * ma khong can goi Google that, va khong can DB.
 */

const config = {
  JWT_ACCESS_SECRET: "a".repeat(40),
  JWT_REFRESH_SECRET: "b".repeat(40),
  JWT_ACCESS_EXPIRES_IN: "15m",
  JWT_REFRESH_EXPIRES_IN: "7d",
  JWT_ISSUER: "test",
  CLIENT_URL: "http://localhost:5173",
  MAGIC_LINK_EXPIRES_IN: "15m",
  MAGIC_LINK_REDIRECT_PATH: "/auth/magic-link/callback",
  MAGIC_LINK_ENABLED: true,
  GOOGLE_OAUTH_ENABLED: true,
  isProduction: false,
};

function buildService(overrides = {}) {
  const users = {
    getById: vi.fn(),
    findByEmail: vi.fn(),
    createWithPassword: vi.fn(),
    findOrCreateByProvider: vi.fn(),
    markEmailVerified: vi.fn(),
    touchLastLogin: vi.fn().mockResolvedValue(true),
    ...overrides.users,
  };
  const tokens = {
    issue: vi.fn().mockResolvedValue({}),
    findUsable: vi.fn(),
    consume: vi.fn(),
    revoke: vi.fn().mockResolvedValue({}),
    revokeAllForUser: vi.fn().mockResolvedValue({}),
    ...overrides.tokens,
  };
  const mailer = {
    sendMagicLink: vi.fn().mockResolvedValue({}),
    sendWelcome: vi.fn().mockResolvedValue({}),
    ...overrides.mailer,
  };
  const google = { buildAuthUrl: vi.fn(), exchangeCodeForProfile: vi.fn(), ...overrides.google };

  return {
    service: new AuthService({
      users,
      tokens,
      mailer,
      google,
      config: { ...config, ...overrides.config },
    }),
    users,
    tokens,
    mailer,
    google,
  };
}

const fakeUser = { id: "user-1", email: "a@example.com", role: "member", isActive: true };

describe("AuthService.issueSession", () => {
  it("tra ve cap access/refresh token va luu refresh vao kho token", async () => {
    const { service, tokens } = buildService();

    const session = await service.issueSession(fakeUser, { ipAddress: "1.2.3.4" });

    expect(session.accessToken).toBeTruthy();
    expect(session.refreshToken).toBeTruthy();
    expect(session.accessToken).not.toBe(session.refreshToken);
    expect(session.expiresIn).toBe(900);

    expect(tokens.issue).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        type: TOKEN_TYPES.REFRESH,
        ipAddress: "1.2.3.4",
      }),
    );
  });

  it("hai lan cap lien tiep sinh ra token KHAC NHAU (nho jti)", async () => {
    const { service } = buildService();
    const a = await service.issueSession(fakeUser);
    const b = await service.issueSession(fakeUser);
    expect(a.refreshToken).not.toBe(b.refreshToken);
  });
});

describe("AuthService - Google OAuth", () => {
  it("tra ve 400 khi tinh nang dang tat", async () => {
    const { service } = buildService({ config: { GOOGLE_OAUTH_ENABLED: false } });
    await expect(service.loginWithGoogle({ code: "abc" })).rejects.toThrowError(/dang tat/i);
  });

  it("doi code lay ho so roi tao phien cho nguoi dung moi", async () => {
    const { service, google, users } = buildService();

    google.exchangeCodeForProfile.mockResolvedValue({
      providerId: "google-sub-123",
      email: "newbie@example.com",
      name: "Newbie",
      avatarUrl: "https://img/avatar.png",
      isEmailVerified: true,
    });
    users.findOrCreateByProvider.mockResolvedValue({
      user: { ...fakeUser, email: "newbie@example.com" },
      isNewUser: true,
    });

    const session = await service.loginWithGoogle({ code: "code-tu-google" });

    expect(google.exchangeCodeForProfile).toHaveBeenCalledWith("code-tu-google");
    expect(users.findOrCreateByProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "newbie@example.com",
        provider: AUTH_PROVIDERS.GOOGLE,
        providerId: "google-sub-123",
      }),
    );
    expect(session.isNewUser).toBe(true);
    expect(session.accessToken).toBeTruthy();
  });

  it("tai khoan bi khoa -> 403 du Google xac thuc thanh cong", async () => {
    const { service, google, users } = buildService();
    google.exchangeCodeForProfile.mockResolvedValue({ email: "x@y.z", providerId: "s" });
    users.findOrCreateByProvider.mockResolvedValue({
      user: { ...fakeUser, isActive: false },
      isNewUser: false,
    });

    await expect(service.loginWithGoogle({ code: "abc" })).rejects.toMatchObject({
      statusCode: 403,
    });
  });
});

describe("AuthService - Magic link", () => {
  it("gui mail kem link tro ve frontend", async () => {
    const { service, mailer, users, tokens } = buildService();
    users.findByEmail.mockResolvedValue(fakeUser);

    const result = await service.requestMagicLink({ email: "a@example.com" });

    expect(tokens.issue).toHaveBeenCalledWith(
      expect.objectContaining({ type: TOKEN_TYPES.MAGIC_LINK }),
    );
    const link = mailer.sendMagicLink.mock.calls[0][0].link;
    expect(link).toContain("http://localhost:5173/auth/magic-link/callback?token=");
    expect(result.devToken).toBeTruthy();
  });

  it("KHONG lo devToken o moi truong production", async () => {
    const { service, users } = buildService({ config: { isProduction: true } });
    users.findByEmail.mockResolvedValue(fakeUser);

    const result = await service.requestMagicLink({ email: "a@example.com" });
    expect(result.devToken).toBeUndefined();
  });

  it("tai khoan bi khoa -> khong gui mail nhung van tra ve thong bao trung tinh", async () => {
    const { service, mailer, users } = buildService();
    users.findByEmail.mockResolvedValue({ ...fakeUser, isActive: false });

    const result = await service.requestMagicLink({ email: "a@example.com" });

    expect(mailer.sendMagicLink).not.toHaveBeenCalled();
    expect(result.message).toMatch(/Neu email ton tai/i);
  });

  it("tinh nang tat -> 400", async () => {
    const { service } = buildService({ config: { MAGIC_LINK_ENABLED: false } });
    await expect(service.requestMagicLink({ email: "a@b.co" })).rejects.toThrowError(/dang tat/i);
  });

  it("token khong dung duoc -> 401", async () => {
    const { service, tokens } = buildService();
    tokens.consume.mockResolvedValue(null);
    await expect(service.verifyMagicLink({ token: "x" })).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});

describe("AuthService - refresh token", () => {
  it("thieu token -> 401", async () => {
    const { service } = buildService();
    await expect(service.refreshSession({})).rejects.toMatchObject({ statusCode: 401 });
  });

  it("token hop le nhung khong con trong kho -> thu hoi TOAN BO token cua nguoi dung", async () => {
    const { service, tokens } = buildService();
    const { refreshToken } = await service.issueSession(fakeUser);
    tokens.findUsable.mockResolvedValue(null);

    await expect(service.refreshSession({ refreshToken })).rejects.toThrowError(/thu hoi/i);
    // Nghi ngo token bi danh cap -> vo hieu hoa moi phien de an toan
    expect(tokens.revokeAllForUser).toHaveBeenCalledWith("user-1", TOKEN_TYPES.REFRESH);
  });

  it("refresh thanh cong se thu hoi token cu (rotation)", async () => {
    const { service, tokens, users } = buildService();
    const { refreshToken } = await service.issueSession(fakeUser);
    tokens.findUsable.mockResolvedValue({ user: "user-1" });
    users.getById.mockResolvedValue(fakeUser);

    const session = await service.refreshSession({ refreshToken });

    expect(tokens.revoke).toHaveBeenCalledWith(refreshToken, TOKEN_TYPES.REFRESH);
    expect(session.accessToken).toBeTruthy();
  });
});

describe("AuthService - dang nhap bang mat khau", () => {
  it("nguoi dung khong ton tai -> 401 voi thong bao trung tinh", async () => {
    const { service, users } = buildService();
    users.findByEmail.mockResolvedValue(null);

    await expect(
      service.loginWithPassword({ email: "a@b.co", password: "x" }),
    ).rejects.toMatchObject({ statusCode: 401, message: "Email hoac mat khau khong dung" });
  });

  it("tai khoan chi co Google (khong co password) -> 401 chu khong phai 500", async () => {
    const { service, users } = buildService();
    users.findByEmail.mockResolvedValue({ ...fakeUser, password: undefined });

    const error = await service
      .loginWithPassword({ email: "a@b.co", password: "x" })
      .catch((e) => e);
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(401);
  });
});
