import { z } from "zod";

/** Schema form san pham - khop voi backend/src/modules/product/product.validation.js */
export const productFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Ten san pham phai co it nhat 2 ky tu")
    .max(200, "Ten san pham toi da 200 ky tu"),

  // Input HTML luon tra ve chuoi -> coerce de chuyen sang so
  price: z.coerce.number({ message: "Gia phai la so" }).nonnegative("Gia khong duoc am"),

  stock: z.coerce
    .number({ message: "Ton kho phai la so" })
    .int("Ton kho phai la so nguyen")
    .nonnegative("Ton kho khong duoc am"),

  description: z.string().trim().max(5000, "Mo ta toi da 5000 ky tu").optional().or(z.literal("")),

  isActive: z.boolean(),
});

export const productFormDefaults = {
  title: "",
  price: 0,
  stock: 0,
  description: "",
  isActive: true,
};
