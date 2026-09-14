import mongoose from "mongoose";
import { ZodError } from "zod";
import { AppError, ERROR_CODES } from "../errors/index.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { logger } from "../utils/logger.js";

/**
 * Middleware xu ly loi TAP TRUNG - phai duoc dang ky CUOI CUNG trong app.
 *
 * Nhiem vu:
 * 1. Dich moi loai loi (Zod, Mongoose, JWT, loi la) ve mot AppError chuan.
 * 2. Log dung muc do (loi 5xx moi can stack trace).
 * 3. Tra ve JSON dong nhat; o production KHONG lo chi tiet noi bo.
 */
export function errorHandler({ isProduction = false } = {}) {
  // eslint-disable-next-line no-unused-vars -- Express nhan dien error middleware qua so tham so (4)
  return (error, req, res, next) => {
    const appError = normalizeError(error);
    const log = req.logger ?? logger;

    if (appError.statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
      log.error(appError.message, {
        errorCode: appError.errorCode,
        stack: error?.stack,
        path: req.originalUrl,
      });
    } else {
      log.warn(appError.message, { errorCode: appError.errorCode, path: req.originalUrl });
    }

    const body = appError.toJSON();

    // O production: khong lo thong diep noi bo cua loi 500
    if (isProduction && appError.statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
      body.message = "Da co loi xay ra, vui long thu lai sau";
      delete body.details;
    }
    if (!isProduction && error?.stack) {
      body.stack = error.stack.split("\n").slice(0, 5);
    }

    res.status(appError.statusCode).json(body);
  };
}

/** Dich moi loai loi ve AppError. Tach rieng de test truc tiep. */
export function normalizeError(error) {
  if (error instanceof AppError) return error;

  // ----- Zod (khi service tu goi schema.parse() ngoai middleware validate) -----
  if (error instanceof ZodError) {
    return AppError.validation(
      "Du lieu khong hop le",
      error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      })),
    );
  }

  // ----- Mongoose: sai dinh dang ObjectId -----
  if (error instanceof mongoose.Error.CastError) {
    return AppError.badRequest(`Gia tri khong hop le cho truong "${error.path}"`);
  }

  // ----- Mongoose: vi pham rang buoc schema -----
  if (error instanceof mongoose.Error.ValidationError) {
    return AppError.validation(
      "Du lieu khong hop le",
      Object.values(error.errors).map((item) => ({ field: item.path, message: item.message })),
    );
  }

  // ----- MongoDB: trung khoa duy nhat (unique index) -----
  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern ?? error.keyValue ?? {})[0] ?? "gia tri";
    return AppError.conflict(`${field} da ton tai trong he thong`);
  }

  // ----- JWT -----
  if (error?.name === "TokenExpiredError") {
    return AppError.unauthorized("Token da het han", ERROR_CODES.TOKEN_EXPIRED);
  }
  if (error?.name === "JsonWebTokenError") {
    return AppError.unauthorized("Token khong hop le", ERROR_CODES.TOKEN_INVALID);
  }

  // ----- JSON body sai cu phap (body-parser) -----
  if (error?.type === "entity.parse.failed") {
    return AppError.badRequest("Body khong phai JSON hop le");
  }
  if (error?.type === "entity.too.large") {
    return AppError.badRequest("Du lieu gui len qua lon");
  }

  // ----- Loi khong luong truoc: coi la bug -----
  return AppError.internal(error?.message || "Loi he thong khong xac dinh", error);
}

/**
 * Bat cac loi thoat ra ngoai vong doi request (unhandledRejection / uncaughtException).
 * Nguyen tac: log roi tat process mot cach co trat tu - process manager se khoi dong lai.
 */
export function registerProcessErrorHandlers({ onShutdown } = {}) {
  const handle = (kind) => (error) => {
    logger.error(`${kind} - tien trinh se dung lai`, {
      message: error?.message,
      stack: error?.stack,
    });
    Promise.resolve(onShutdown?.()).finally(() => process.exit(1));
  };

  process.on("unhandledRejection", handle("unhandledRejection"));
  process.on("uncaughtException", handle("uncaughtException"));
}
