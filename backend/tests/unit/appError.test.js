import { describe, expect, it } from "vitest";
import { AppError, ERROR_CODES, isAppError } from "../../src/core/errors/index.js";

describe("AppError", () => {
  it("mac dinh la loi 500 khong phai operational", () => {
    const error = AppError.internal("Hong roi");
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(false);
  });

  it.each([
    ["badRequest", 400, ERROR_CODES.BAD_REQUEST],
    ["unauthorized", 401, ERROR_CODES.UNAUTHENTICATED],
    ["forbidden", 403, ERROR_CODES.FORBIDDEN],
    ["notFound", 404, ERROR_CODES.NOT_FOUND],
    ["conflict", 409, ERROR_CODES.CONFLICT],
    ["validation", 422, ERROR_CODES.VALIDATION_ERROR],
    ["tooManyRequests", 429, ERROR_CODES.RATE_LIMITED],
  ])("factory %s tra ve status %i va errorCode dung", (factory, status, code) => {
    const error = AppError[factory]();
    expect(error.statusCode).toBe(status);
    expect(error.errorCode).toBe(code);
    expect(error.isOperational).toBe(true);
  });

  it("toJSON tra ve dung hinh dang response loi", () => {
    const error = AppError.validation("Sai roi", [{ field: "email", message: "Bat buoc" }]);
    expect(error.toJSON()).toEqual({
      success: false,
      message: "Sai roi",
      errorCode: ERROR_CODES.VALIDATION_ERROR,
      details: [{ field: "email", message: "Bat buoc" }],
    });
  });

  it("khong co details thi khong them key details vao JSON", () => {
    expect(AppError.notFound().toJSON()).not.toHaveProperty("details");
  });

  it("giu duoc loi goc qua cause", () => {
    const root = new Error("loi goc");
    expect(AppError.internal("boc lai", root).cause).toBe(root);
  });

  it("isAppError phan biet dung voi Error thuong", () => {
    expect(isAppError(AppError.notFound())).toBe(true);
    expect(isAppError(new Error("thuong"))).toBe(false);
  });
});
