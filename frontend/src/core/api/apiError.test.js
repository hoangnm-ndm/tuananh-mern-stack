import { describe, expect, it } from "vitest";
import { ApiError, normalizeAxiosError } from "./apiError.js";

describe("ApiError", () => {
  it("nhan dien dung tung loai loi theo status", () => {
    expect(new ApiError({ status: 401 }).isUnauthorized).toBe(true);
    expect(new ApiError({ status: 403 }).isForbidden).toBe(true);
    expect(new ApiError({ status: 404 }).isNotFound).toBe(true);
    expect(new ApiError({ status: 422, errorCode: "VALIDATION_ERROR" }).isValidationError).toBe(
      true,
    );
  });

  describe("toFormErrors - doi loi backend sang dang react-hook-form", () => {
    it("bo tien to body./query./params.", () => {
      const error = new ApiError({
        details: [
          { field: "body.email", message: "Email khong hop le" },
          { field: "query.page", message: "Trang khong hop le" },
          { field: "params.id", message: "ID khong hop le" },
        ],
      });

      expect(error.toFormErrors()).toEqual({
        email: "Email khong hop le",
        page: "Trang khong hop le",
        id: "ID khong hop le",
      });
    });

    it("giu nguyen field khong co tien to", () => {
      const error = new ApiError({ details: [{ field: "email", message: "Sai" }] });
      expect(error.toFormErrors()).toEqual({ email: "Sai" });
    });

    it("tra ve object rong khi khong co details", () => {
      expect(new ApiError({}).toFormErrors()).toEqual({});
      expect(new ApiError({ details: "khong phai mang" }).toFormErrors()).toEqual({});
    });

    it("bo qua phan tu thieu field", () => {
      const error = new ApiError({
        details: [{ message: "khong co field" }, { field: "a", message: "ok" }],
      });
      expect(error.toFormErrors()).toEqual({ a: "ok" });
    });
  });
});

describe("normalizeAxiosError", () => {
  it("loi co response -> lay message va errorCode tu backend", () => {
    const error = normalizeAxiosError({
      response: {
        status: 409,
        data: { message: "Email da ton tai", errorCode: "EMAIL_ALREADY_EXISTS" },
      },
    });

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(409);
    expect(error.message).toBe("Email da ton tai");
    expect(error.errorCode).toBe("EMAIL_ALREADY_EXISTS");
    expect(error.isNetworkError).toBe(false);
  });

  it("response khong co message -> dung thong bao mac dinh kem status", () => {
    const error = normalizeAxiosError({ response: { status: 500, data: {} } });
    expect(error.message).toContain("500");
  });

  it("mat mang -> danh dau isNetworkError", () => {
    const error = normalizeAxiosError({ request: {} });
    expect(error.isNetworkError).toBe(true);
    expect(error.errorCode).toBe("NETWORK_ERROR");
    expect(error.message).toMatch(/duong truyen mang/i);
  });

  it("timeout -> thong bao rieng", () => {
    const error = normalizeAxiosError({ request: {}, code: "ECONNABORTED" });
    expect(error.errorCode).toBe("TIMEOUT");
    expect(error.message).toMatch(/qua lau/i);
  });

  it("loi cau hinh -> giu nguyen thong bao goc", () => {
    const error = normalizeAxiosError(new Error("Cau hinh sai"));
    expect(error.message).toBe("Cau hinh sai");
    expect(error.status).toBe(0);
  });
});
