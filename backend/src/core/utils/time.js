/**
 * Chuyen chuoi thoi luong dang "15m", "7d", "30s", "2h" sang mili giay.
 * Dung chung cho JWT expiresIn <-> cookie maxAge de 2 noi luon khop nhau.
 */
const UNIT_TO_MS = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
  w: 7 * 24 * 60 * 60 * 1000,
};

export function parseDuration(input) {
  if (typeof input === "number") return input;
  const match = /^(\d+(?:\.\d+)?)\s*(ms|s|m|h|d|w)$/i.exec(String(input).trim());
  if (!match) throw new Error(`Thoi luong khong hop le: "${input}" (vi du hop le: 15m, 7d, 30s)`);
  const [, amount, unit] = match;
  return Number(amount) * UNIT_TO_MS[unit.toLowerCase()];
}

/** Tra ve Date o thoi diem hien tai + duration. */
export function addDuration(duration, from = new Date()) {
  return new Date(from.getTime() + parseDuration(duration));
}

export function isExpired(date) {
  return !date || new Date(date).getTime() <= Date.now();
}
