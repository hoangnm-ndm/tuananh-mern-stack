import { ApiResponse } from "../../core/http/ApiResponse.js";
import { asyncHandler } from "../../core/http/asyncHandler.js";
import { userService } from "./user.service.js";

/**
 * Controller chi lam 3 viec: doc request -> goi service -> tra response.
 * Moi rang buoc nghiep vu nam o service; moi kiem tra dinh dang nam o validation.
 */
export const userController = {
  /** GET /users - danh sach (admin). */
  list: asyncHandler(async (req, res) => {
    const result = await userService.list(req.query);
    return ApiResponse.paginated(res, result, "Lay danh sach nguoi dung thanh cong");
  }),

  /** GET /users/:id */
  getById: asyncHandler(async (req, res) => {
    const user = await userService.getById(req.params.id);
    return ApiResponse.ok(res, user, "Lay thong tin nguoi dung thanh cong");
  }),

  /** POST /users - admin tao nguoi dung. */
  create: asyncHandler(async (req, res) => {
    const user = await userService.createWithPassword(req.body);
    return ApiResponse.created(res, user, "Tao nguoi dung thanh cong");
  }),

  /** PATCH /users/:id */
  update: asyncHandler(async (req, res) => {
    const user = await userService.update(req.params.id, req.body);
    return ApiResponse.ok(res, user, "Cap nhat nguoi dung thanh cong");
  }),

  /** DELETE /users/:id */
  remove: asyncHandler(async (req, res) => {
    await userService.remove(req.params.id);
    return ApiResponse.ok(res, null, "Xoa nguoi dung thanh cong");
  }),

  /** PATCH /users/:id/role - chi superAdmin. */
  changeRole: asyncHandler(async (req, res) => {
    const user = await userService.changeRole(req.params.id, req.body.role, req.user);
    return ApiResponse.ok(res, user, "Cap nhat vai tro thanh cong");
  }),

  /** PATCH /users/:id/status - khoa/mo tai khoan. */
  setActiveStatus: asyncHandler(async (req, res) => {
    const user = await userService.setActiveStatus(req.params.id, req.body.isActive, req.user);
    return ApiResponse.ok(
      res,
      user,
      req.body.isActive ? "Da mo khoa tai khoan" : "Da khoa tai khoan",
    );
  }),

  // ---------- Cac endpoint cua chinh nguoi dang dang nhap ----------

  /** GET /users/me */
  getProfile: asyncHandler(async (req, res) => {
    return ApiResponse.ok(res, req.user, "Lay ho so thanh cong");
  }),

  /** PATCH /users/me */
  updateProfile: asyncHandler(async (req, res) => {
    const user = await userService.update(req.user.id, req.body);
    return ApiResponse.ok(res, user, "Cap nhat ho so thanh cong");
  }),

  /** POST /users/me/change-password */
  changePassword: asyncHandler(async (req, res) => {
    await userService.changePassword(req.user.id, req.body);
    return ApiResponse.ok(res, null, "Doi mat khau thanh cong");
  }),
};
