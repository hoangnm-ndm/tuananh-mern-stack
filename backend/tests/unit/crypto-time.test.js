import { describe, expect, it } from "vitest";
import { generateRandomToken, hashToken, safeCompare } from "../../src/core/utils/crypto.js";
import { addDuration, isExpired, parseDuration } from "../../src/core/utils/time.js";
import { slugify } from "../../src/core/utils/slug.js";
import { compact, omit, pick } from "../../src/core/utils/pick.js";

describe("crypto", () => {
  it("sinh token ngau nhien, an toan cho URL", () => {
    const token = generateRandomToken(32);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token).not.toBe(generateRandomToken(32));
  });

  it("hashToken on dinh va khac ban ro", () => {
    expect(hashToken("abc")).toBe(hashToken("abc"));
    expect(hashToken("abc")).not.toBe("abc");
    expect(hashToken("abc")).toHaveLength(64);
  });

  it("safeCompare so sanh dung ke ca khi do dai khac nhau", () => {
    expect(safeCompare("abc", "abc")).toBe(true);
    expect(safeCompare("abc", "abd")).toBe(false);
    expect(safeCompare("abc", "abcdef")).toBe(false);
  });
});

describe("time", () => {
  it.each([
    ["30s", 30_000],
    ["15m", 900_000],
    ["2h", 7_200_000],
    ["7d", 604_800_000],
    [5000, 5000],
  ])("parseDuration(%p) = %i ms", (input, expected) => {
    expect(parseDuration(input)).toBe(expected);
  });

  it("nem loi voi dinh dang khong hop le", () => {
    expect(() => parseDuration("15 phut")).toThrowError(/khong hop le/);
  });

  it("addDuration cong dung khoang thoi gian", () => {
    const base = new Date("2026-01-01T00:00:00Z");
    expect(addDuration("1h", base).toISOString()).toBe("2026-01-01T01:00:00.000Z");
  });

  it("isExpired nhan dien moc qua khu", () => {
    expect(isExpired(new Date(Date.now() - 1000))).toBe(true);
    expect(isExpired(new Date(Date.now() + 10_000))).toBe(false);
    expect(isExpired(null)).toBe(true);
  });
});

describe("slugify", () => {
  it.each([
    ["Áo thun cổ tròn", "ao-thun-co-tron"],
    ["Đồng hồ Đẹp", "dong-ho-dep"],
    ["  Nhiều   khoảng  trắng  ", "nhieu-khoang-trang"],
    ["Giá: 100.000đ!", "gia-100000d"],
  ])("%p -> %p", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });
});

describe("pick / omit / compact", () => {
  const source = { a: 1, b: null, c: "", d: undefined, e: "x" };

  it("pick chi lay key ton tai va khac undefined", () => {
    expect(pick(source, ["a", "e", "d", "zzz"])).toEqual({ a: 1, e: "x" });
  });

  it("omit loai bo key chi dinh", () => {
    expect(omit({ a: 1, b: 2 }, ["b"])).toEqual({ a: 1 });
  });

  it("compact loai bo null/undefined/chuoi rong", () => {
    expect(compact(source)).toEqual({ a: 1, e: "x" });
  });
});
