import bcrypt from "bcryptjs";

/**
 * Bam va kiem tra mat khau bang bcrypt.
 * BCRYPT_ROUNDS cang cao cang cham (an toan hon). 10-12 la muc can bang pho bien.
 */
const DEFAULT_ROUNDS = 10;

export async function hashPassword(plainPassword, rounds = DEFAULT_ROUNDS) {
  return bcrypt.hash(plainPassword, rounds);
}

export async function comparePassword(plainPassword, hashedPassword) {
  if (!plainPassword || !hashedPassword) return false;
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Danh gia do manh mat khau (0-4). Dung de goi y cho nguoi dung,
 * KHONG thay the validate bang zod.
 */
export function getPasswordStrength(password = "") {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
}
