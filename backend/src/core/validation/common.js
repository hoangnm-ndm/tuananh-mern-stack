import mongoose from "mongoose";
import { z } from "zod";

/**
 * Cac schema Zod dung lai o nhieu module.
 * Gom o day de thong diep loi dong nhat toan he thong.
 */

/** ObjectId cua MongoDB (24 ky tu hex). */
export const objectIdSchema = z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
  message: "ID khong hop le",
});

/** Params dang /:id */
export const idParamSchema = z.object({ id: objectIdSchema });

/** Email: chuan hoa ve chu thuong + cat khoang trang. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ message: "Email khong hop le" }));

/**
 * Mat khau manh: >= 8 ky tu, co chu hoa, chu thuong va so.
 * Dung CHUNG voi frontend (frontend co ban sao tuong duong trong src/features/auth/schemas).
 */
export const passwordSchema = z
  .string()
  .min(8, "Mat khau phai co it nhat 8 ky tu")
  .max(128, "Mat khau toi da 128 ky tu")
  .regex(/[a-z]/, "Mat khau phai co it nhat 1 chu thuong")
  .regex(/[A-Z]/, "Mat khau phai co it nhat 1 chu hoa")
  .regex(/\d/, "Mat khau phai co it nhat 1 chu so");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Ten phai co it nhat 2 ky tu")
  .max(80, "Ten toi da 80 ky tu");

/** Query phan trang dung chung. */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
  search: z.string().trim().optional(),
});

/**
 * Tao schema query danh sach cho mot module, ke thua paginationQuerySchema.
 * @param {import("zod").ZodRawShape} extraShape Field loc rieng cua module.
 */
export function createListQuerySchema(extraShape = {}) {
  return paginationQuerySchema.extend(extraShape);
}
