import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDebounce } from "./useDebounce.js";

describe("useDebounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("tra ve gia tri ban dau ngay lap tuc", () => {
    const { result } = renderHook(() => useDebounce("ban dau", 300));
    expect(result.current).toBe("ban dau");
  });

  it("chua cap nhat truoc khi het thoi gian cho", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    expect(result.current).toBe("a");

    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe("a");

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("b");
  });

  it("go lien tuc chi cap nhat MOT lan o cuoi", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "" },
    });

    for (const text of ["a", "ao", "ao t", "ao th"]) {
      rerender({ value: text });
      act(() => vi.advanceTimersByTime(100)); // moi lan go cach nhau 100ms
    }

    expect(result.current).toBe(""); // chua du 300ms yen lang
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("ao th");
  });
});
