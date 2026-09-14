import { describe, expect, it } from "vitest";
import {
  comparePassword,
  getPasswordStrength,
  hashPassword,
} from "../../src/core/utils/password.js";

describe("hashPassword / comparePassword", () => {
  it("bam ra chuoi khac ban ro", async () => {
    const hashed = await hashPassword("MatKhau@123", 4);
    expect(hashed).not.toBe("MatKhau@123");
    expect(hashed.startsWith("$2")).toBe(true);
  });

  it("cung mat khau bam 2 lan cho ket qua khac nhau (co salt)", async () => {
    const a = await hashPassword("MatKhau@123", 4);
    const b = await hashPassword("MatKhau@123", 4);
    expect(a).not.toBe(b);
  });

  it("so sanh dung/sai chinh xac", async () => {
    const hashed = await hashPassword("MatKhau@123", 4);
    await expect(comparePassword("MatKhau@123", hashed)).resolves.toBe(true);
    await expect(comparePassword("SaiRoi@123", hashed)).resolves.toBe(false);
  });

  it("tra ve false thay vi nem loi khi thieu tham so", async () => {
    await expect(comparePassword("", "hash")).resolves.toBe(false);
    await expect(comparePassword("abc", null)).resolves.toBe(false);
  });
});

describe("getPasswordStrength", () => {
  it.each([
    ["abc", 0],
    ["abcdefgh", 1],
    ["abcdefghijkl", 2],
    ["abcdEFGHijkl", 3],
    ["abcdEFGH12!@", 4],
  ])("mat khau %p -> diem %i", (password, expected) => {
    expect(getPasswordStrength(password)).toBe(expected);
  });
});
