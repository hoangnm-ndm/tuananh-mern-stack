import { z } from "zod";

/**
 * Schema Zod cho form dang nhap / dang ky.
 *
 * PHAI KHOP voi backend (backend/src/core/validation/common.js).
 * Validate o client de phan hoi tuc thi; backend van validate lai vi
 * moi thu gui tu trinh duyet deu co the bi sua.
 */

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Vui long nhap email")
  .pipe(z.email("Email khong hop le"));

export const passwordSchema = z
  .string()
  .min(8, "Mat khau phai co it nhat 8 ky tu")
  .max(128, "Mat khau toi da 128 ky tu")
  .regex(/[a-z]/, "Mat khau phai co it nhat 1 chu thuong")
  .regex(/[A-Z]/, "Mat khau phai co it nhat 1 chu hoa")
  .regex(/\d/, "Mat khau phai co it nhat 1 chu so");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Vui long nhap mat khau"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Ten phai co it nhat 2 ky tu").max(80, "Ten toi da 80 ky tu"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Vui long xac nhan mat khau"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mat khau xac nhan khong khop",
    path: ["confirmPassword"],
  });

export const magicLinkSchema = z.object({
  email: emailSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui long nhap mat khau hien tai"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Vui long xac nhan mat khau moi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mat khau xac nhan khong khop",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Mat khau moi phai khac mat khau hien tai",
    path: ["newPassword"],
  });

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Ten phai co it nhat 2 ky tu").max(80),
});
