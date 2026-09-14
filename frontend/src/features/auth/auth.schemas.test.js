import { describe, expect, it } from "vitest";
import {
  changePasswordSchema,
  emailSchema,
  loginSchema,
  passwordSchema,
  registerSchema,
} from "./auth.schemas.js";

/**
 * Cac schema nay PHAI cung quy tac voi backend.
 * Neu backend doi rang buoc, test o day se nhac ta cap nhat theo.
 */

describe("emailSchema", () => {
  it("chuan hoa ve chu thuong va cat khoang trang", () => {
    expect(emailSchema.parse("  Admin@Example.COM  ")).toBe("admin@example.com");
  });

  it.each(["khong-phai-email", "thieu@tenmien", "@example.com", ""])("tu choi %p", (value) => {
    expect(emailSchema.safeParse(value).success).toBe(false);
  });
});

describe("passwordSchema - khop rang buoc cua backend", () => {
  it.each([
    ["Abcd1234", true, "du 8 ky tu, co hoa/thuong/so"],
    ["Abc123", false, "chi 6 ky tu"],
    ["abcd1234", false, "thieu chu hoa"],
    ["ABCD1234", false, "thieu chu thuong"],
    ["AbcdEfgh", false, "thieu chu so"],
  ])("%p -> %p (%s)", (password, expected) => {
    expect(passwordSchema.safeParse(password).success).toBe(expected);
  });
});

describe("loginSchema", () => {
  it("chi yeu cau mat khau khong rong (khong ap do manh)", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "cu" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
  });
});

describe("registerSchema", () => {
  const valid = {
    name: "Nguyen Van A",
    email: "a@example.com",
    password: "MatKhau123",
    confirmPassword: "MatKhau123",
  };

  it("chap nhan du lieu hop le", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("bao loi o dung truong confirmPassword khi khong khop", () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: "Khac12345" });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
  });

  it("ten qua ngan bi tu choi", () => {
    expect(registerSchema.safeParse({ ...valid, name: "A" }).success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  it("tu choi khi mat khau moi trung mat khau cu", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "MatKhau123",
      newPassword: "MatKhau123",
      confirmPassword: "MatKhau123",
    });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toEqual(["newPassword"]);
  });

  it("chap nhan khi hop le", () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "MatKhauCu1",
        newPassword: "MatKhauMoi2",
        confirmPassword: "MatKhauMoi2",
      }).success,
    ).toBe(true);
  });
});
