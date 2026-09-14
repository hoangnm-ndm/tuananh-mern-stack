import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

/** Don dep DOM sau moi test de chung khong anh huong lan nhau. */
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

/** jsdom chua co matchMedia - mot so component co the dung toi. */
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});
