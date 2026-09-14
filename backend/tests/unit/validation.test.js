import { describe, expect, it } from "vitest";
import {
  emailSchema,
  objectIdSchema,
  paginationQuerySchema,
  passwordSchema,
} from "../../src/core/validation/common.js";
import { registerSchema, loginSchema } from "../../src/modules/auth/auth.validation.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../../src/modules/product/product.validation.js";
import { changePasswordSchema } from "../../src/modules/user/user.validation.js";

describe("schema dung chung", () => {
  it("objectIdSchema chi chap nhan ObjectId hop le", () => {
    expect(objectIdSchema.safeParse("507f1f77bcf86cd799439011").success).toBe(true);
    expect(objectIdSchema.safeParse("123").success).toBe(false);
  });

  it("emailSchema chuan hoa ve chu thuong va cat khoang trang", () => {
    expect(emailSchema.parse("  Admin@Example.COM ")).toBe("admin@example.com");
    expect(emailSchema.safeParse("khong-phai-email").success).toBe(false);
  });

  it.each([
    ["ngan1A", false, "qua ngan"],
    ["khongcochuhoa1", false, "thieu chu hoa"],
    ["KHONGCOCHUTHUONG1", false, "thieu chu thuong"],
    ["KhongCoChuSo", false, "thieu chu so"],
    ["MatKhau123", true, "hop le"],
  ])("passwordSchema(%p) -> %p (%s)", (password, expected) => {
    expect(passwordSchema.safeParse(password).success).toBe(expected);
  });

  it("paginationQuerySchema ap mac dinh va chan tran limit", () => {
    expect(paginationQuerySchema.parse({})).toMatchObject({ page: 1, limit: 10 });
    expect(paginationQuerySchema.safeParse({ limit: "500" }).success).toBe(false);
  });
});

describe("schema xac thuc", () => {
  const valid = {
    email: "user@example.com",
    password: "MatKhau123",
    confirmPassword: "MatKhau123",
    name: "Nguyen Van A",
  };

  it("dang ky hop le", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("mat khau xac nhan khong khop -> bao loi dung truong", () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: "Khac123456" });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
  });

  it("dang nhap khong ap rang buoc do manh mat khau", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "cu" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
  });
});

describe("schema san pham", () => {
  it("ep kieu gia tu chuoi sang so", () => {
    expect(createProductSchema.parse({ title: "Ao", price: "100" }).price).toBe(100);
  });

  it("tu dien gia tri mac dinh", () => {
    const parsed = createProductSchema.parse({ title: "Ao", price: 100 });
    expect(parsed).toMatchObject({ description: "", stock: 0, isActive: true });
  });

  it("tu choi gia am va ten qua ngan", () => {
    expect(createProductSchema.safeParse({ title: "Ao", price: -1 }).success).toBe(false);
    expect(createProductSchema.safeParse({ title: "A", price: 1 }).success).toBe(false);
  });

  it("cap nhat rong bi tu choi", () => {
    expect(updateProductSchema.safeParse({}).success).toBe(false);
    expect(updateProductSchema.safeParse({ price: 10 }).success).toBe(true);
  });
});

describe("schema doi mat khau", () => {
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
