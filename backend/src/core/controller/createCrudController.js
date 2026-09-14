import { ApiResponse } from "../http/ApiResponse.js";
import { asyncHandler } from "../http/asyncHandler.js";

/**
 * Sinh bo 5 handler CRUD chuan tu mot service.
 * Muc dich: mot module CRUD thuan tuy chi can ~10 dong code.
 *
 * Moi handler deu duoc boc asyncHandler -> khong can try/catch.
 *
 * @param {import("../service/BaseService.js").BaseService} service
 * @param {object} [options]
 * @param {string} [options.resourceName] Dung trong thong bao tra ve.
 * @param {(req:any)=>object} [options.buildExtraFilter] Them dieu kien loc theo request
 *        (vd: chi lay ban ghi cua chinh nguoi dung dang dang nhap).
 * @param {(req:any)=>object} [options.buildCreatePayload] Bo sung field khi tao (vd: createdBy).
 */
export function createCrudController(service, options = {}) {
  const {
    resourceName = "ban ghi",
    buildExtraFilter,
    buildCreatePayload,
    selectOnList,
    populateOnDetail,
  } = options;

  return {
    list: asyncHandler(async (req, res) => {
      const result = await service.list(req.query, {
        extraFilter: buildExtraFilter ? buildExtraFilter(req) : {},
        select: selectOnList,
      });
      return ApiResponse.paginated(res, result, `Lay danh sach ${resourceName} thanh cong`);
    }),

    getById: asyncHandler(async (req, res) => {
      const document = await service.getById(req.params.id, { populate: populateOnDetail });
      return ApiResponse.ok(res, document, `Lay chi tiet ${resourceName} thanh cong`);
    }),

    create: asyncHandler(async (req, res) => {
      const payload = buildCreatePayload ? { ...req.body, ...buildCreatePayload(req) } : req.body;
      const created = await service.create(payload);
      return ApiResponse.created(res, created, `Tao ${resourceName} thanh cong`);
    }),

    update: asyncHandler(async (req, res) => {
      const updated = await service.update(req.params.id, req.body);
      return ApiResponse.ok(res, updated, `Cap nhat ${resourceName} thanh cong`);
    }),

    remove: asyncHandler(async (req, res) => {
      await service.remove(req.params.id);
      return ApiResponse.ok(res, null, `Xoa ${resourceName} thanh cong`);
    }),
  };
}
