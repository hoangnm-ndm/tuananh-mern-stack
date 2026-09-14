import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { validate } from "../../src/core/middlewares/validate.js";
import {
  requireAllPermissions,
  requireMinRole,
  requireOwnershipOr,
  requirePermission,
  requireRole,
} from "../../src/core/middlewares/authorize.js";
import { normalizeError } from "../../src/core/middlewares/errorHandler.js";
import { asyncHandler } from "../../src/core/http/asyncHandler.js";
import { AppError, ERROR_CODES } from "../../src/core/errors/index.js";
import { PERMISSIONS, ROLES } from "../../src/core/constants/roles.js";

/** Tao doi tuong req/res gia lap toi thieu du de chay middleware. */
function mockReq(overrides = {}) {
  return { body: {}, params: {}, query: {}, headers: {}, cookies: {}, ...overrides };
}

describe("middleware validate", () => {
  const bodySchema = z.object({ email: z.email(), age: z.coerce.number().int().min(1) });

  it("cho di tiep khi du lieu hop le", () => {
    const req = mockReq({ body: { email: "a@b.co", age: "30" } });
    const next = vi.fn();

    validate({ body: bodySchema })(req, {}, next);

    expect(next).toHaveBeenCalledWith();
    // Gia tri da duoc EP KIEU: "30" -> 30
    expect(req.body.age).toBe(30);
  });

  it("gom tat ca loi vao mot AppError 422", () => {
    const req = mockReq({ body: { email: "sai", age: "0" } });
    const next = vi.fn();

    validate({ body: bodySchema })(req, {}, next);

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(422);
    expect(error.errorCode).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(error.details).toHaveLength(2);
    expect(error.details[0].field).toBe("body.email");
  });

  it("validate duoc nhieu phan cua request cung luc", () => {
    const req = mockReq({ body: { email: "a@b.co", age: "1" }, params: { id: "abc" } });
    const next = vi.fn();

    validate({ body: bodySchema, params: z.object({ id: z.string().length(24) }) })(req, {}, next);

    const error = next.mock.calls[0][0];
    expect(error.details).toHaveLength(1);
    expect(error.details[0].location).toBe("params");
  });

  it("query da parse duoc gan vao req.query va req.validatedQuery", () => {
    const req = mockReq({ query: { page: "2" } });
    const next = vi.fn();

    validate({ query: z.object({ page: z.coerce.number().default(1) }) })(req, {}, next);

    expect(req.query.page).toBe(2);
    expect(req.validatedQuery.page).toBe(2);
  });

  it("khong khai bao schema cho phan nao thi bo qua phan do", () => {
    const req = mockReq({ body: { bat_ky: true } });
    const next = vi.fn();
    validate({})(req, {}, next);
    expect(next).toHaveBeenCalledWith();
  });
});

describe("middleware phan quyen", () => {
  const admin = mockReq({ user: { id: "1", role: ROLES.ADMIN } });
  const member = mockReq({ user: { id: "2", role: ROLES.MEMBER } });
  const superAdmin = mockReq({ user: { id: "3", role: ROLES.SUPER_ADMIN } });

  it("chua dang nhap -> 401", () => {
    const next = vi.fn();
    requireRole(ROLES.ADMIN)(mockReq(), {}, next);
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it("requireRole chi cho vai tro nam trong danh sach", () => {
    const allow = vi.fn();
    requireRole(ROLES.ADMIN)(admin, {}, allow);
    expect(allow).toHaveBeenCalledWith();

    const deny = vi.fn();
    requireRole(ROLES.ADMIN)(member, {}, deny);
    expect(deny.mock.calls[0][0].statusCode).toBe(403);
  });

  it("requireMinRole cho phep vai tro cao hon", () => {
    const allow = vi.fn();
    requireMinRole(ROLES.ADMIN)(superAdmin, {}, allow);
    expect(allow).toHaveBeenCalledWith();

    const deny = vi.fn();
    requireMinRole(ROLES.ADMIN)(member, {}, deny);
    expect(deny.mock.calls[0][0].statusCode).toBe(403);
  });

  it("requirePermission kiem tra theo quyen chi tiet", () => {
    const allow = vi.fn();
    requirePermission(PERMISSIONS.PRODUCT_CREATE)(admin, {}, allow);
    expect(allow).toHaveBeenCalledWith();

    const deny = vi.fn();
    requirePermission(PERMISSIONS.PRODUCT_CREATE)(member, {}, deny);
    const error = deny.mock.calls[0][0];
    expect(error.errorCode).toBe(ERROR_CODES.INSUFFICIENT_PERMISSION);
    expect(error.details.requiredPermissions).toContain(PERMISSIONS.PRODUCT_CREATE);
  });

  it("requireAllPermissions doi hoi du moi quyen", () => {
    const deny = vi.fn();
    requireAllPermissions(PERMISSIONS.PRODUCT_CREATE, PERMISSIONS.USER_DELETE)(admin, {}, deny);
    expect(deny.mock.calls[0][0].statusCode).toBe(403);

    const allow = vi.fn();
    requireAllPermissions(PERMISSIONS.PRODUCT_CREATE, PERMISSIONS.USER_DELETE)(
      superAdmin,
      {},
      allow,
    );
    expect(allow).toHaveBeenCalledWith();
  });

  it("requireOwnershipOr cho chu so huu di qua", async () => {
    const next = vi.fn();
    await requireOwnershipOr({ getOwnerId: () => "2" })(member, {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("requireOwnershipOr chan nguoi khong phai chu so huu", async () => {
    const next = vi.fn();
    await requireOwnershipOr({ getOwnerId: () => "999" })(member, {}, next);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  it("requireOwnershipOr cho admin di qua du khong phai chu so huu", async () => {
    const next = vi.fn();
    await requireOwnershipOr({ getOwnerId: () => "999" })(admin, {}, next);
    expect(next).toHaveBeenCalledWith();
  });
});

describe("normalizeError", () => {
  it("giu nguyen AppError", () => {
    const original = AppError.notFound("khong thay");
    expect(normalizeError(original)).toBe(original);
  });

  it("dich ZodError thanh loi 422", () => {
    const result = z.object({ a: z.string() }).safeParse({ a: 1 });
    const normalized = normalizeError(result.error);
    expect(normalized.statusCode).toBe(422);
    expect(normalized.details[0].field).toBe("a");
  });

  it("dich loi trung khoa duy nhat (11000) thanh 409", () => {
    const normalized = normalizeError({ code: 11000, keyPattern: { email: 1 } });
    expect(normalized.statusCode).toBe(409);
    expect(normalized.message).toContain("email");
  });

  it("dich loi JWT thanh 401", () => {
    expect(normalizeError({ name: "TokenExpiredError" }).errorCode).toBe(ERROR_CODES.TOKEN_EXPIRED);
    expect(normalizeError({ name: "JsonWebTokenError" }).errorCode).toBe(ERROR_CODES.TOKEN_INVALID);
  });

  it("dich loi JSON body hong thanh 400", () => {
    expect(normalizeError({ type: "entity.parse.failed" }).statusCode).toBe(400);
    expect(normalizeError({ type: "entity.too.large" }).statusCode).toBe(400);
  });

  it("loi la duoc coi la bug (500, khong operational)", () => {
    const normalized = normalizeError(new Error("bat ngo"));
    expect(normalized.statusCode).toBe(500);
    expect(normalized.isOperational).toBe(false);
  });
});

describe("asyncHandler", () => {
  it("chuyen loi cua handler async sang next()", async () => {
    const next = vi.fn();
    const error = new Error("no roi");

    await asyncHandler(async () => {
      throw error;
    })(mockReq(), {}, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("khong goi next khi handler chay thanh cong", async () => {
    const next = vi.fn();
    const handler = vi.fn().mockResolvedValue("ok");

    await asyncHandler(handler)(mockReq(), {}, next);

    expect(handler).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("bat ca loi nem dong bo", async () => {
    const next = vi.fn();
    await asyncHandler(() => {
      throw new Error("dong bo");
    })(mockReq(), {}, next);
    expect(next.mock.calls[0][0].message).toBe("dong bo");
  });
});
