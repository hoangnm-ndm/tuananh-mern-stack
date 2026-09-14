/**
 * Thiet lap chay TRUOC moi file test.
 * Dat bien moi truong o day de src/config/env.js validate thanh cong
 * ma khong phu thuoc vao file .env cua may lap trinh vien.
 */
process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";
process.env.PORT = "0";
process.env.DB_URI = process.env.DB_URI ?? "mongodb://127.0.0.1:27017/source_base_test";
process.env.JWT_ACCESS_SECRET = "test-access-secret-phai-dai-hon-32-ky-tu-abcdef";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-phai-dai-hon-32-ky-tu-abcdef";
process.env.JWT_ACCESS_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.CORS_ORIGINS = "http://localhost:5173";
process.env.BCRYPT_ROUNDS = "4"; // giam vong bam de test chay nhanh
process.env.MAIL_DRIVER = "console";
process.env.MAGIC_LINK_ENABLED = "true";
process.env.GOOGLE_OAUTH_ENABLED = "false";
