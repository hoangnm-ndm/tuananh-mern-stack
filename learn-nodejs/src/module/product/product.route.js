import { Router } from "express";
import { getAllProducts } from "./product.controller.js";

const productRouter = Router();

productRouter.get("/", getAllProducts);

export default productRouter;
