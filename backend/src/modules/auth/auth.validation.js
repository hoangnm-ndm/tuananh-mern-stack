import { z } from "zod";
import { emailSchema, nameSchema, passwordSchema } from "../../core/validation/common.js";

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    name: nameSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mat khau xac nhan khong khop",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  // Khi DANG NHAP khong ap rang buoc do manh: mat khau cu co the khong dat chuan moi.
  password: z.string().min(1, "Vui long nhap mat khau"),
});

export const magicLinkRequestSchema = z.object({
  email: emailSchema,
});

export const magicLinkVerifySchema = z.object({
  token: z.string().min(20, "Token khong hop le"),
});

/** Query Google tra ve o callback. Google co the tra ve `error` khi nguoi dung tu choi. */
export const googleCallbackQuerySchema = z.object({
  code: z.string().min(1).optional(),
  state: z.string().optional(),
  error: z.string().optional(),
});

export const refreshSchema = z.object({
  /** Uu tien doc tu cookie httpOnly; body chi la phuong an du phong cho client mobile. */
  refreshToken: z.string().optional(),
});
