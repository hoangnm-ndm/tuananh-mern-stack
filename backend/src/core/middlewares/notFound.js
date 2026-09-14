import { AppError } from "../errors/index.js";

/** Bat moi route khong khop -> chuyen thanh AppError 404 de errorHandler xu ly thong nhat. */
export function notFoundHandler() {
  return (req, _res, next) => {
    next(AppError.notFound(`Khong tim thay endpoint: ${req.method} ${req.originalUrl}`));
  };
}
