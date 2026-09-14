import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils.jsx";
import { ApiError } from "@/core/api/apiError.js";
import LoginPage from "./LoginPage.jsx";

/**
 * Gia lap lop API - khong request that.
 * Cau hinh env cung duoc gia lap de bat/tat feature flag theo tung test.
 */
vi.mock("../auth.api.js", () => ({
  authApi: {
    login: vi.fn(),
    requestMagicLink: vi.fn(),
    getGoogleAuthUrl: vi.fn(),
  },
}));

vi.mock("@/core/config/env.js", () => ({
  env: {
    APP_NAME: "Source Base",
    ENABLE_MAGIC_LINK: true,
    ENABLE_GOOGLE_LOGIN: true,
  },
}));

const { authApi } = await import("../auth.api.js");

describe("LoginPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("hien day du cac o nhap va nut dang nhap", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mat khau/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dang nhap" })).toBeInTheDocument();
  });

  it("validate phia client: khong goi API khi email sai dinh dang", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/Email/), "khong-phai-email");
    await user.type(screen.getByLabelText(/Mat khau/), "MatKhau123");
    await user.click(screen.getByRole("button", { name: "Dang nhap" }));

    expect(await screen.findByText("Email khong hop le")).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it("bao loi khi bo trong mat khau", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/Email/), "a@example.com");
    await user.click(screen.getByRole("button", { name: "Dang nhap" }));

    expect(await screen.findByText("Vui long nhap mat khau")).toBeInTheDocument();
  });

  it("gui dung du lieu len API khi form hop le", async () => {
    const user = userEvent.setup();
    authApi.login.mockResolvedValue({
      data: { accessToken: "token", user: { id: "1", name: "A", role: "member" } },
    });

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/Email/), "a@example.com");
    await user.type(screen.getByLabelText(/Mat khau/), "MatKhau123");
    await user.click(screen.getByRole("button", { name: "Dang nhap" }));

    await waitFor(() =>
      expect(authApi.login).toHaveBeenCalledWith({
        email: "a@example.com",
        password: "MatKhau123",
      }),
    );
  });

  it("hien thong bao khi backend tra ve sai thong tin dang nhap", async () => {
    const user = userEvent.setup();
    authApi.login.mockRejectedValue(
      new ApiError({
        message: "Email hoac mat khau khong dung",
        status: 401,
        errorCode: "INVALID_CREDENTIALS",
      }),
    );

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/Email/), "a@example.com");
    await user.type(screen.getByLabelText(/Mat khau/), "SaiMatKhau1");
    await user.click(screen.getByRole("button", { name: "Dang nhap" }));

    expect(await screen.findByText("Email hoac mat khau khong dung")).toBeInTheDocument();
  });

  it("loi validate cua backend duoc gan vao dung o nhap", async () => {
    const user = userEvent.setup();
    authApi.login.mockRejectedValue(
      new ApiError({
        message: "Du lieu khong hop le",
        status: 422,
        errorCode: "VALIDATION_ERROR",
        details: [{ field: "body.email", message: "Email nay da bi chan" }],
      }),
    );

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/Email/), "a@example.com");
    await user.type(screen.getByLabelText(/Mat khau/), "MatKhau123");
    await user.click(screen.getByRole("button", { name: "Dang nhap" }));

    expect(await screen.findByText("Email nay da bi chan")).toBeInTheDocument();
  });

  it("chuyen duoc sang che do magic link va quay lai", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.click(screen.getByText(/Dang nhap bang lien ket email/));
    expect(screen.getByRole("button", { name: "Gui lien ket dang nhap" })).toBeInTheDocument();
    expect(screen.queryByLabelText(/Mat khau/)).not.toBeInTheDocument();

    await user.click(screen.getByText("Dang nhap bang mat khau"));
    expect(screen.getByLabelText(/Mat khau/)).toBeInTheDocument();
  });

  it("gui magic link xong thi hien man hinh xac nhan", async () => {
    const user = userEvent.setup();
    authApi.requestMagicLink.mockResolvedValue({
      data: {},
      message: "Neu email ton tai, chung toi da gui lien ket.",
    });

    renderWithProviders(<LoginPage />);

    await user.click(screen.getByText(/Dang nhap bang lien ket email/));
    await user.type(screen.getByLabelText(/Email/), "a@example.com");
    await user.click(screen.getByRole("button", { name: "Gui lien ket dang nhap" }));

    expect(await screen.findByText("Da gui lien ket dang nhap")).toBeInTheDocument();
    expect(screen.getByText("a@example.com")).toBeInTheDocument();
  });

  it("hien nut Google khi feature flag bat", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByRole("button", { name: /Dang nhap voi Google/ })).toBeInTheDocument();
  });
});
