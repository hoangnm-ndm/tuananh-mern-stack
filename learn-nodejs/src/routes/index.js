import { Router } from "express";
import productRouter from "../module/product/product.route.js";
import authRouter from "../module/auth/auth.route.js";

const routes = Router();

routes.use("/products", productRouter);
routes.use("/auth", authRouter);

export default routes;
