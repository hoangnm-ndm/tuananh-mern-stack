import { beforeEach, describe, expect, it, vi } from "vitest";
import { tokenStorage } from "./tokenStorage.js";

describe("tokenStorage", () => {
  beforeEach(() => tokenStorage.clear());

  it("luu va doc lai duoc token", () => {
    tokenStorage.set("abc123");
    expect(tokenStorage.get()).toBe("abc123");
  });

  it("clear xoa token ve null", () => {
    tokenStorage.set("abc");
    tokenStorage.clear();
    expect(tokenStorage.get()).toBeNull();
  });

  it("KHONG ghi vao localStorage (quyet dinh bao mat co chu dich)", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem");
    tokenStorage.set("abc");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("bao cho nguoi dang ky khi token doi", () => {
    const listener = vi.fn();
    const unsubscribe = tokenStorage.subscribe(listener);

    tokenStorage.set("token-1");
    expect(listener).toHaveBeenCalledWith("token-1");

    tokenStorage.clear();
    expect(listener).toHaveBeenCalledWith(null);

    unsubscribe();
    tokenStorage.set("token-2");
    expect(listener).toHaveBeenCalledTimes(2); // khong nhan them sau khi huy dang ky
  });

  it("set(undefined) quy ve null", () => {
    tokenStorage.set(undefined);
    expect(tokenStorage.get()).toBeNull();
  });
});
