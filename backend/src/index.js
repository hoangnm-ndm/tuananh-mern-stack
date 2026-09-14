import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { logger } from "./core/utils/logger.js";
import { registerProcessErrorHandlers } from "./core/middlewares/errorHandler.js";

/**
 * Diem khoi dong server.
 *
 * Thu tu: ket noi DB -> lang nghe cong -> dang ky tat may an toan (graceful shutdown).
 * Neu DB loi ngay tu dau thi DUNG luon, khong chay app "nua voi".
 */
async function bootstrap() {
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`${env.APP_NAME} dang chay`, {
      url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
      env: env.NODE_ENV,
    });
  });

  /**
   * Tat may an toan: ngung nhan ket noi moi, cho request dang do hoan tat,
   * dong DB roi moi thoat. Tranh cat ngang giao dich dang chay.
   */
  const shutdown = async (signal) => {
    logger.info(`Nhan tin hieu ${signal}, dang tat server...`);

    const forceExit = setTimeout(() => {
      logger.error("Khong the tat trong 10s - buoc thoat");
      process.exit(1);
    }, 10_000);
    forceExit.unref();

    server.close(async () => {
      await disconnectDatabase().catch(() => {});
      logger.info("Da tat server an toan");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  registerProcessErrorHandlers({
    onShutdown: () => disconnectDatabase().catch(() => {}),
  });

  return server;
}

bootstrap().catch((error) => {
  logger.error("Khoi dong that bai", { message: error.message, stack: error.stack });
  process.exit(1);
});
