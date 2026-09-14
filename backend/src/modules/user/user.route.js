import { Router } from "express";
import { validate } from "../../core/middlewares/validate.js";
import { requirePermission, requireRole } from "../../core/middlewares/authorize.js";
import { PERMISSIONS, ROLES } from "../../core/constants/roles.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { userController } from "./user.controller.js";
import {
  changePasswordSchema,
  changeRoleSchema,
  createUserSchema,
  listUsersQuerySchema,
  setActiveSchema,
  updateProfileSchema,
  updateUserSchema,
  userIdParamSchema,
} from "./user.validation.js";

const router = Router();

// Tat ca route ben duoi deu yeu cau dang nhap
router.use(requireAuth);

// ---------- Ho so cua chinh minh (moi vai tro deu duoc) ----------
router.get("/me", userController.getProfile);
router.patch("/me", validate({ body: updateProfileSchema }), userController.updateProfile);
router.post(
  "/me/change-password",
  validate({ body: changePasswordSchema }),
  userController.changePassword,
);

// ---------- Quan tri nguoi dung ----------
router.get(
  "/",
  requirePermission(PERMISSIONS.USER_READ),
  validate({ query: listUsersQuerySchema }),
  userController.list,
);

router.post(
  "/",
  requirePermission(PERMISSIONS.USER_CREATE),
  validate({ body: createUserSchema }),
  userController.create,
);

router.get(
  "/:id",
  requirePermission(PERMISSIONS.USER_READ),
  validate({ params: userIdParamSchema }),
  userController.getById,
);

router.patch(
  "/:id",
  requirePermission(PERMISSIONS.USER_UPDATE),
  validate({ params: userIdParamSchema, body: updateUserSchema }),
  userController.update,
);

router.delete(
  "/:id",
  requirePermission(PERMISSIONS.USER_DELETE),
  validate({ params: userIdParamSchema }),
  userController.remove,
);

// Doi vai tro: chi superAdmin, va service con chan them cac truong hop nguy hiem
router.patch(
  "/:id/role",
  requireRole(ROLES.SUPER_ADMIN),
  validate({ params: userIdParamSchema, body: changeRoleSchema }),
  userController.changeRole,
);

router.patch(
  "/:id/status",
  requirePermission(PERMISSIONS.USER_UPDATE),
  validate({ params: userIdParamSchema, body: setActiveSchema }),
  userController.setActiveStatus,
);

export default router;
