import { ERROR_CODES } from "../config/constants.js";

/**
 * Loi API da duoc CHUAN HOA.
 *
 * Vi sao can lop nay?
 * Loi tu axios co the den tu 3 nguon rat khac nhau:
 *   1. Server tra ve loi  -> co error.response
 *   2. Mat mang / timeout -> co error.request nhung khong co response
 *   3. Loi cau hinh code  -> khong co ca hai
 * Component khong nen phai biet 3 truong hop do. Chung chi can doc `.message`.
 */
export class ApiError extends Error {
  constructor({
    message,
    status = 0,
    errorCode = "UNKNOWN",
    details = null,
    isNetworkError = false,
  }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errorCode = errorCode;
    this.details = details;
    this.isNetworkError = isNetworkError;
  }

  get isValidationError() {
    return this.errorCode === ERROR_CODES.VALIDATION_ERROR;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }

  /**
   * Doi `details` cua backend thanh dang react-hook-form hieu duoc.
   * Backend tra ve: [{ field: "body.email", message: "..." }]
   * RHF can:        { email: "..." }
   */
  toFormErrors() {
    if (!Array.isArray(this.details)) return {};

    return this.details.reduce((accumulator, item) => {
      if (!item?.field) return accumulator;
      // Bo tien to "body." / "query." / "params."
      const field = String(item.field).replace(/^(body|query|params|headers|cookies)\./, "");
      accumulator[field] = item.message;
      return accumulator;
    }, {});
  }
}

/** Chuyen loi tho cua axios thanh ApiError. */
export function normalizeAxiosError(error) {
  // 1. Server co tra loi
  if (error.response) {
    const { status, data } = error.response;
    return new ApiError({
      message: data?.message || `Yeu cau that bai (HTTP ${status})`,
      status,
      errorCode: data?.errorCode ?? "UNKNOWN",
      details: data?.details ?? null,
    });
  }

  // 2. Da gui di nhung khong nhan duoc phan hoi
  if (error.request) {
    const isTimeout = error.code === "ECONNABORTED";
    return new ApiError({
      message: isTimeout
        ? "May chu phan hoi qua lau, vui long thu lai."
        : "Khong ket noi duoc toi may chu. Kiem tra duong truyen mang.",
      isNetworkError: true,
      errorCode: isTimeout ? "TIMEOUT" : "NETWORK_ERROR",
    });
  }

  // 3. Loi khi dung request (thuong la bug phia client)
  return new ApiError({ message: error.message || "Da co loi khong xac dinh" });
}
