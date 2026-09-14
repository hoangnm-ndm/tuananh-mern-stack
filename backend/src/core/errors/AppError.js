import { HTTP_STATUS } from "../constants/httpStatus.js";
import { ERROR_CODES } from "./errorCodes.js";

/**
 * AppError - loi "co chu dich" (operational error) do ung dung chu dong nem ra.
 *
 * Phan biet voi loi lap trinh (programmer error):
 * - isOperational = true  -> loi du doan truoc, tra ve client duoc (vd: 404, 400).
 * - isOperational = false -> bug, chi log chi tiet, client chi thay 500 chung chung.
 *
 * @example throw AppError.notFound("Khong tim thay san pham");
 */
export class AppError extends Error {
  /**
   * @param {string} message Thong diep hien thi cho client.
   * @param {object} [options]
   * @param {number} [options.statusCode=500] HTTP status.
   * @param {string} [options.errorCode] Ma loi nghiep vu (ERROR_CODES).
   * @param {unknown} [options.details] Chi tiet bo sung (vd: danh sach loi validate).
   * @param {boolean} [options.isOperational=true]
   * @param {Error}  [options.cause] Loi goc (giu chuoi nguyen nhan).
   */
  constructor(message, options = {}) {
    const {
      statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
      errorCode = ERROR_CODES.INTERNAL_ERROR,
      details,
      isOperational = true,
      cause,
    } = options;

    super(message, cause ? { cause } : undefined);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace?.(this, this.constructor);
  }

  /** Chuyen thanh payload JSON tra ve client. */
  toJSON() {
    return {
      success: false,
      message: this.message,
      errorCode: this.errorCode,
      ...(this.details !== undefined ? { details: this.details } : {}),
    };
  }

  // ---------- Factory: dung thay cho `new AppError(...)` cho ngan gon ----------

  static badRequest(
    message = "Yeu cau khong hop le",
    details,
    errorCode = ERROR_CODES.BAD_REQUEST,
  ) {
    return new AppError(message, { statusCode: HTTP_STATUS.BAD_REQUEST, errorCode, details });
  }

  static validation(message = "Du lieu khong hop le", details) {
    return new AppError(message, {
      statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      errorCode: ERROR_CODES.VALIDATION_ERROR,
      details,
    });
  }

  static unauthorized(message = "Ban chua dang nhap", errorCode = ERROR_CODES.UNAUTHENTICATED) {
    return new AppError(message, { statusCode: HTTP_STATUS.UNAUTHORIZED, errorCode });
  }

  static forbidden(message = "Ban khong co quyen thuc hien hanh dong nay", details) {
    return new AppError(message, {
      statusCode: HTTP_STATUS.FORBIDDEN,
      errorCode: ERROR_CODES.FORBIDDEN,
      details,
    });
  }

  static notFound(message = "Khong tim thay du lieu") {
    return new AppError(message, {
      statusCode: HTTP_STATUS.NOT_FOUND,
      errorCode: ERROR_CODES.NOT_FOUND,
    });
  }

  static conflict(message = "Du lieu da ton tai", errorCode = ERROR_CODES.CONFLICT) {
    return new AppError(message, { statusCode: HTTP_STATUS.CONFLICT, errorCode });
  }

  static tooManyRequests(message = "Ban thao tac qua nhanh, vui long thu lai sau") {
    return new AppError(message, {
      statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
      errorCode: ERROR_CODES.RATE_LIMITED,
    });
  }

  static internal(message = "Loi he thong", cause) {
    return new AppError(message, {
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      errorCode: ERROR_CODES.INTERNAL_ERROR,
      isOperational: false,
      cause,
    });
  }
}

/** Helper: kiem tra mot loi bat ky co phai AppError khong. */
export function isAppError(error) {
  return error instanceof AppError;
}
