import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate, formatDateTime, formatNumber, truncate } from "./format.js";

describe("formatCurrency", () => {
  it("dinh dang tien Viet", () => {
    // Intl dung khoang trang khong ngat -> chuan hoa truoc khi so sanh
    expect(formatCurrency(199000).replace(/\s/g, " ")).toMatch(/199\.000/);
  });

  it("tra ve dau gach khi gia tri khong hop le", () => {
    expect(formatCurrency(null)).toBe("-");
    expect(formatCurrency(undefined)).toBe("-");
    expect(formatCurrency("abc")).toBe("-");
  });

  it("xu ly duoc so 0", () => {
    expect(formatCurrency(0)).not.toBe("-");
  });
});

describe("formatNumber", () => {
  it("them dau phan cach hang nghin", () => {
    expect(formatNumber(1234567)).toBe("1.234.567");
  });

  it("gia tri khong hop le -> dau gach", () => {
    expect(formatNumber(null)).toBe("-");
  });
});

describe("formatDate / formatDateTime", () => {
  it("dinh dang ngay/thang/nam", () => {
    expect(formatDate("2026-03-15T10:30:00Z")).toMatch(/15\/03\/2026/);
  });

  it("them gio phut voi formatDateTime", () => {
    expect(formatDateTime("2026-03-15T10:30:00Z")).toMatch(/15\/03\/2026/);
  });

  it("gia tri rong hoac sai -> dau gach", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate("khong-phai-ngay")).toBe("-");
  });
});

describe("truncate", () => {
  it("giu nguyen chuoi ngan", () => {
    expect(truncate("ngan", 10)).toBe("ngan");
  });

  it("cat chuoi dai va them dau ba cham", () => {
    const result = truncate("a".repeat(100), 10);
    expect(result).toHaveLength(11); // 10 ky tu + dau …
    expect(result.endsWith("…")).toBe(true);
  });

  it("chuoi rong -> chuoi rong", () => {
    expect(truncate("")).toBe("");
    expect(truncate(null)).toBe("");
  });
});
