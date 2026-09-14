import crypto from "node:crypto";

/**
 * Tien ich mat ma dung cho token ngau nhien (magic link, reset password...).
 *
 * Nguyen tac: token GUI cho nguoi dung la ban ro (raw), nhung LUU trong DB la ban bam (hash).
 * Neu DB bi lo, ke tan cong khong the dung hash de dang nhap.
 */

/** Sinh chuoi ngau nhien an toan, dang base64url (khong ky tu dac biet trong URL). */
export function generateRandomToken(byteLength = 32) {
  return crypto.randomBytes(byteLength).toString("base64url");
}

/** Bam token bang SHA-256 (nhanh, du an toan cho token ngau nhien do entropy cao). */
export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** So sanh 2 chuoi theo thoi gian hang so -> chong timing attack. */
export function safeCompare(a, b) {
  const bufferA = Buffer.from(String(a));
  const bufferB = Buffer.from(String(b));
  if (bufferA.length !== bufferB.length) return false;
  return crypto.timingSafeEqual(bufferA, bufferB);
}

/** Sinh chuoi state cho OAuth (chong CSRF trong luong redirect). */
export function generateOAuthState() {
  return generateRandomToken(24);
}
