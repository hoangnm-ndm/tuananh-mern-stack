import { z } from "zod";
import {
  createListQuerySchema,
  emailSchema,
  idParamSchema,
  nameSchema,
  passwordSchema,
} from "../../core/validation/common.js";
import { ROLE_VALUES } from "../../core/constants/roles.js";

export const userIdParamSchema = idParamSchema;

export const listUsersQuerySchema = createListQuerySchema({
  role: z.enum(ROLE_VALUES).optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  role: z.enum(ROLE_VALUES).optional(),
});

/** Nguoi dung tu cap nhat ho so cua chinh minh. */
export const updateProfileSchema = z
  .object({
    name: nameSchema.optional(),
    avatarUrl: z.url({ message: "Avatar phai la URL hop le" }).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Can it nhat mot truong de cap nhat",
  });

/** Admin cap nhat nguoi dung khac. */
export const updateUserSchema = z
  .object({
    name: nameSchema.optional(),
    avatarUrl: z.url().nullable().optional(),
    isActive: z.boolean().optional(),
    isEmailVerified: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Can it nhat mot truong de cap nhat",
  });

export const changeRoleSchema = z.object({
  role: z.enum(ROLE_VALUES, { message: "Vai tro khong hop le" }),
});

export const setActiveSchema = z.object({
  isActive: z.boolean(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui long nhap mat khau hien tai"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mat khau xac nhan khong khop",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Mat khau moi phai khac mat khau hien tai",
    path: ["newPassword"],
  });
