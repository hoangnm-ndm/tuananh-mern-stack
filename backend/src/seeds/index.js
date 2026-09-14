import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { env } from "../config/env.js";
import { logger } from "../core/utils/logger.js";
import { ROLES } from "../core/constants/roles.js";
import { AUTH_PROVIDERS } from "../core/constants/auth.js";
import { User } from "../modules/user/user.model.js";
import { Product } from "../modules/product/product.model.js";

/**
 * Seed du lieu khoi tao.
 * An toan khi chay nhieu lan (idempotent): chi tao khi chua ton tai.
 *
 * Chay: npm run seed        (tu thu muc goc hoac backend/)
 */

async function seedUsers() {
  const accounts = [
    {
      email: env.SEED_SUPER_ADMIN_EMAIL,
      password: env.SEED_SUPER_ADMIN_PASSWORD,
      name: "Super Admin",
      role: ROLES.SUPER_ADMIN,
    },
    { email: "admin@example.com", password: "Admin@12345", name: "Admin", role: ROLES.ADMIN },
    { email: "member@example.com", password: "Member@12345", name: "Member", role: ROLES.MEMBER },
  ];

  const created = [];

  for (const account of accounts) {
    const existing = await User.findOne({ email: account.email });
    if (existing) {
      logger.info(`Bo qua (da ton tai): ${account.email}`);
      continue;
    }

    // Dung .save() (khong dung insertMany) de hook bam mat khau duoc chay
    const user = new User({
      ...account,
      isEmailVerified: true,
      providers: [{ name: AUTH_PROVIDERS.LOCAL }],
    });
    await user.save();
    created.push(account.email);
  }

  logger.info(`Seed nguoi dung xong`, { created: created.length });
  return User.findOne({ role: ROLES.SUPER_ADMIN });
}

async function seedProducts(owner) {
  const count = await Product.countDocuments();
  if (count > 0) {
    logger.info(`Bo qua seed san pham (da co ${count} ban ghi)`);
    return;
  }

  const samples = [
    { title: "Ao thun co tron", price: 199000, stock: 50, description: "Cotton 100%, form rong" },
    { title: "Quan jeans slim fit", price: 459000, stock: 30, description: "Denim co gian" },
    { title: "Giay sneaker trang", price: 899000, stock: 20, description: "De cao su chong truot" },
    { title: "Balo chong nuoc", price: 349000, stock: 40, description: "Ngan laptop 15 inch" },
    { title: "Mu luoi trai", price: 129000, stock: 100, description: "Vai kaki, khoa dieu chinh" },
  ];

  for (const sample of samples) {
    // Dung .save() de hook sinh slug duoc chay
    await new Product({ ...sample, createdBy: owner?._id ?? null }).save();
  }

  logger.info(`Seed san pham xong`, { created: samples.length });
}

async function run() {
  await connectDatabase();
  const superAdmin = await seedUsers();
  await seedProducts(superAdmin);
  await disconnectDatabase();
  logger.info("Hoan tat seed du lieu");
}

run().catch(async (error) => {
  logger.error("Seed that bai", { message: error.message, stack: error.stack });
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
