/**
 * Dang ky module - MOT NOI DUY NHAT can sua khi them module moi.
 *
 * Them module: tao thu muc trong `modules/`, export router, roi them 1 dong vao mang duoi day.
 */
import authRouter from "./auth/auth.route.js";
import productRouter from "./product/product.route.js";
import userRouter from "./user/user.route.js";

/** @type {{ path: string, router: import("express").Router, description: string }[]} */
export const moduleRoutes = [
  {
    path: "/auth",
    router: authRouter,
    description: "Xac thuc: email/password, Google, magic link",
  },
  { path: "/users", router: userRouter, description: "Quan ly nguoi dung va phan quyen" },
  { path: "/products", router: productRouter, description: "Module mau - CRUD san pham" },
];
