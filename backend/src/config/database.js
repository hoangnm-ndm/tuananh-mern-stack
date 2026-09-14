import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../core/utils/logger.js";

/**
 * Ket noi MongoDB qua Mongoose.
 *
 * Luu y:
 * - strictQuery=true: bo qua field khong khai bao trong schema khi query -> tranh loc nham.
 * - Lang nghe su kien de biet ket noi rot giua chung (production hay gap).
 */

mongoose.set("strictQuery", true);

let connectionPromise = null;

export async function connectDatabase(uri = env.DB_URI, options = {}) {
  if (connectionPromise) return connectionPromise;

  connectionPromise = mongoose
    .connect(uri, {
      ...(env.DB_NAME ? { dbName: env.DB_NAME } : {}),
      serverSelectionTimeoutMS: 10_000,
      ...options,
    })
    .then((connection) => {
      logger.info("Ket noi MongoDB thanh cong", { host: connection.connection.host });
      return connection;
    })
    .catch((error) => {
      connectionPromise = null;
      logger.error("Ket noi MongoDB that bai", { message: error.message });
      throw error;
    });

  return connectionPromise;
}

export async function disconnectDatabase() {
  connectionPromise = null;
  await mongoose.disconnect();
  logger.info("Da dong ket noi MongoDB");
}

/** Trang thai ket noi dang chuoi de dua vao health check. */
export function getDatabaseStatus() {
  const states = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
  return states[mongoose.connection.readyState] ?? "unknown";
}

mongoose.connection.on("disconnected", () => logger.warn("MongoDB da ngat ket noi"));
mongoose.connection.on("reconnected", () => logger.info("MongoDB da ket noi lai"));
mongoose.connection.on("error", (error) => logger.error("Loi MongoDB", { message: error.message }));
