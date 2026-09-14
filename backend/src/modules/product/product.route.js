import { Router } from "express";
import { z } from "zod";
import { validate } from "../../core/middlewares/validate.js";
import { requirePermission } from "../../core/middlewares/authorize.js";
import { PERMISSIONS } from "../../core/constants/roles.js";
import { requireAuth, attachUserIfPresent } from "../auth/auth.middleware.js";
import { productController } from "./product.controller.js";
import {
  createProductSchema,
  listProductsQuerySchema,
  productIdParamSchema,
  updateProductSchema,
} from "./product.validation.js";

const router = Router();

// ---------- Cong khai (khong can dang nhap) ----------
router.get(
  "/public",
  attachUserIfPresent,
  validate({ query: listProductsQuerySchema }),
  productController.listPublic,
);

router.get(
  "/slug/:slug",
  validate({ params: z.object({ slug: z.string().min(1) }) }),
  productController.getBySlug,
);

// ---------- Can dang nhap tu day tro xuong ----------
router.use(requireAuth);

router.get(
  "/",
  requirePermission(PERMISSIONS.PRODUCT_READ),
  validate({ query: listProductsQuerySchema }),
  productController.list,
);

router.get(
  "/:id",
  requirePermission(PERMISSIONS.PRODUCT_READ),
  validate({ params: productIdParamSchema }),
  productController.getById,
);

router.post(
  "/",
  requirePermission(PERMISSIONS.PRODUCT_CREATE),
  validate({ body: createProductSchema }),
  productController.create,
);

router.patch(
  "/:id",
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  validate({ params: productIdParamSchema, body: updateProductSchema }),
  productController.update,
);

router.delete(
  "/:id",
  requirePermission(PERMISSIONS.PRODUCT_DELETE),
  validate({ params: productIdParamSchema }),
  productController.remove,
);

export default router;
