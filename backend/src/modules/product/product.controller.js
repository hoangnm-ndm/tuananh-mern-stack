import { createCrudController } from "../../core/controller/createCrudController.js";
import { ApiResponse } from "../../core/http/ApiResponse.js";
import { asyncHandler } from "../../core/http/asyncHandler.js";
import { AppError } from "../../core/errors/index.js";
import { productService } from "./product.service.js";

/**
 * 5 handler CRUD duoc SINH TU DONG tu service -> khong phai viet lai logic lap.
 * Chi viet tay nhung handler thuc su khac biet.
 */
const crud = createCrudController(productService, {
  resourceName: "san pham",
  // Tu dong gan nguoi tao khi tao moi
  buildCreatePayload: (req) => ({ createdBy: req.user?.id ?? null }),
});

export const productController = {
  ...crud,

  /** GET /products/public - chi san pham dang ban, khong can dang nhap. */
  listPublic: asyncHandler(async (req, res) => {
    const result = await productService.listPublic(req.query);
    return ApiResponse.paginated(res, result, "Lay danh sach san pham thanh cong");
  }),

  /** GET /products/slug/:slug */
  getBySlug: asyncHandler(async (req, res) => {
    const product = await productService.findBySlug(req.params.slug);
    if (!product) throw AppError.notFound("San pham khong ton tai");
    return ApiResponse.ok(res, product, "Lay chi tiet san pham thanh cong");
  }),
};
