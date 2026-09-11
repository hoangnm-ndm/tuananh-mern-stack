import { Router } from "express";
import { login, register, logout } from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/", login);
authRouter.post("/register", register);
authRouter.post("/logout", logout);

export default authRouter;
