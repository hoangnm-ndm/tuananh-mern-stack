import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

/**
 * MongoDB chay hoan toan trong bo nho - test tich hop khong can DB that,
 * khong de lai du lieu rac, va chay duoc tren CI.
 */
let memoryServer = null;

export async function startTestDatabase() {
  if (memoryServer) return mongoose.connection;

  memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri(), { dbName: "test" });
  return mongoose.connection;
}

export async function stopTestDatabase() {
  await mongoose.connection.dropDatabase().catch(() => {});
  await mongoose.disconnect();
  await memoryServer?.stop();
  memoryServer = null;
}

/** Xoa sach du lieu giua cac test de chung khong anh huong lan nhau. */
export async function clearDatabase() {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
}
