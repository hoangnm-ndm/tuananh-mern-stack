import { Router } from "express";
import { moduleRoutes } from "../modules/index.js";
import { ApiResponse } from "../core/http/ApiResponse.js";
import { getDatabaseStatus } from "../config/database.js";
import { env } from "../config/env.js";

/**
 * Router goc cua API (phien ban v1).
 * Moi module tu dang ky prefix cua minh trong `modules/index.js`.
 */
const router = Router();

/** Health check - dung cho load balancer / uptime monitor. */
router.get("/health", (_req, res) => {
  return ApiResponse.ok(
    res,
    {
      status: "ok",
      environment: env.NODE_ENV,
      database: getDatabaseStatus(),
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    "He thong hoat dong binh thuong",
  );
});

/** Liet ke endpoint dang co - tien cho nguoi moi vao du an. */
router.get("/", (_req, res) => {
  return ApiResponse.ok(
    res,
    {
      name: env.APP_NAME,
      version: "v1",
      modules: moduleRoutes.map(({ path, description }) => ({
        basePath: `${env.API_PREFIX}${path}`,
        description,
      })),
    },
    "Danh sach module cua API",
  );
});

for (const { path, router: moduleRouter } of moduleRoutes) {
  router.use(path, moduleRouter);
}

export default router;
