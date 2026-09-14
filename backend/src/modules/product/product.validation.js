import { z } from "zod";
import { createListQuerySchema, idParamSchema } from "../../core/validation/common.js";

export const productIdParamSchema = idParamSchema;

export const listProductsQuerySchema = createListQuerySchema({
  isActive: z.enum(["true", "false"]).optional(),
  price_gte: z.coerce.number().nonnegative().optional(),
  price_lte: z.coerce.number().nonnegative().optional(),
});

/**
 * Hinh dang goc, KHONG kem .default().
 * Tach rieng vi `.partial()` tren schema co .default() van sinh ra key khi input rong
 * -> khien rang buoc "phai gui it nhat mot truong" cua updateProductSchema mat tac dung.
 */
const productShape = {
  title: z.string().trim().min(2, "Ten san pham phai co it nhat 2 ky tu").max(200),
  price: z.coerce.number().nonnegative("Gia phai la so khong am"),
  description: z.string().trim().max(5000),
  imageUrl: z.url({ message: "Anh phai la URL hop le" }).nullable(),
  stock: z.coerce.number().int().nonnegative(),
  isActive: z.boolean(),
};

export const createProductSchema = z.object({
  ...productShape,
  description: productShape.description.optional().default(""),
  imageUrl: productShape.imageUrl.optional(),
  stock: productShape.stock.optional().default(0),
  isActive: productShape.isActive.optional().default(true),
});

/** Cap nhat: moi truong deu tuy chon, nhung phai gui it nhat mot truong. */
export const updateProductSchema = z
  .object(productShape)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Can it nhat mot truong de cap nhat",
  });
