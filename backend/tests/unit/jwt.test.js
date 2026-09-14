import { describe, expect, it } from "vitest";
import { AppError, ERROR_CODES } from "../../src/core/errors/index.js";
import { TOKEN_TYPES } from "../../src/core/constants/auth.js";
import {
  decodeToken,
  extractBearerToken,
  signToken,
  verifyToken,
} from "../../src/core/utils/jwt.js";

const secret = "secret-du-dai-cho-viec-kiem-thu-0123456789";

describe("signToken / verifyToken", () => {
  it("ky roi xac minh lay lai dung payload", () => {
    const token = signToken({ sub: "user-1", role: "admin" }, { secret, expiresIn: "15m" });
    const decoded = verifyToken(token, { secret });
    expect(decoded.sub).toBe("user-1");
    expect(decoded.role).toBe("admin");
    expect(decoded.type).toBe(TOKEN_TYPES.ACCESS);
  });

  it("khong the dung access token thay cho refresh token", () => {
    const accessToken = signToken(
      { sub: "u" },
      { secret, expiresIn: "15m", type: TOKEN_TYPES.ACCESS },
    );
    try {
      verifyToken(accessToken, { secret, type: TOKEN_TYPES.REFRESH });
      throw new Error("Le ra phai nem loi");
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
      expect(error.errorCode).toBe(ERROR_CODES.TOKEN_INVALID);
    }
  });

  it("sai secret -> TOKEN_INVALID", () => {
    const token = signToken({ sub: "u" }, { secret, expiresIn: "15m" });
    expect(() =>
      verifyToken(token, { secret: "secret-khac-du-dai-0123456789abcdef" }),
    ).toThrowError(/khong hop le/i);
  });

  it("token het han -> TOKEN_EXPIRED", () => {
    const token = signToken({ sub: "u" }, { secret, expiresIn: -10 });
    try {
      verifyToken(token, { secret });
      throw new Error("Le ra phai nem loi");
    } catch (error) {
      expect(error.errorCode).toBe(ERROR_CODES.TOKEN_EXPIRED);
    }
  });

  it("kiem tra issuer khi duoc yeu cau", () => {
    const token = signToken({ sub: "u" }, { secret, expiresIn: "15m", issuer: "app-a" });
    expect(verifyToken(token, { secret, issuer: "app-a" }).iss).toBe("app-a");
    expect(() => verifyToken(token, { secret, issuer: "app-b" })).toThrow();
  });

  it("thieu secret khi ky -> loi he thong", () => {
    expect(() => signToken({ sub: "u" }, { expiresIn: "15m" })).toThrowError(/Thieu secret/);
  });

  it("decodeToken doc duoc payload ma khong can secret", () => {
    const token = signToken({ sub: "u" }, { secret, expiresIn: "15m" });
    expect(decodeToken(token).sub).toBe("u");
  });
});

describe("extractBearerToken", () => {
  it.each([
    ["Bearer abc.def.ghi", "abc.def.ghi"],
    ["bearer abc", "abc"],
    ["Basic abc", null],
    ["Bearer", null],
    ["", null],
    [undefined, null],
    [123, null],
  ])("header %p -> %p", (header, expected) => {
    expect(extractBearerToken(header)).toBe(expected);
  });
});
