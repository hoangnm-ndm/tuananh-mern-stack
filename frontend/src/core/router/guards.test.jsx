import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { AuthContext } from "../auth/AuthContext.js";
import { RequireAuth, RequireGuest, RequirePermission } from "./guards.jsx";
import { PATHS } from "./paths.js";
import { PERMISSIONS, ROLES } from "../config/constants.js";
import { createAuthValue, mockUsers } from "@/test/utils.jsx";

/**
 * Dung router that (createMemoryRouter) de kiem duoc ca viec CHUYEN HUONG,
 * khong chi kiem noi dung hien ra.
 */
function renderGuard(guardElement, { auth = {}, initialEntries = ["/duoc-bao-ve"] } = {}) {
  const authValue = createAuthValue(auth);

  const router = createMemoryRouter(
    [
      {
        path: "/duoc-bao-ve",
        element: guardElement,
        children: [{ index: true, element: <p>NOI DUNG BI CHAN</p> }],
      },
      { path: PATHS.LOGIN, element: <p>TRANG DANG NHAP</p> },
      { path: PATHS.FORBIDDEN, element: <p>TRANG 403</p> },
      { path: PATHS.HOME, element: <p>TRANG CHU</p> },
    ],
    { initialEntries },
  );

  return render(
    <AuthContext.Provider value={authValue}>
      <RouterProvider router={router} />
    </AuthContext.Provider>,
  );
}

describe("RequireAuth", () => {
  it("hien man hinh cho trong khi dang khoi phuc phien", () => {
    renderGuard(<RequireAuth />, { auth: { isInitializing: true } });
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("NOI DUNG BI CHAN")).not.toBeInTheDocument();
  });

  it("chua dang nhap -> chuyen ve trang dang nhap", () => {
    renderGuard(<RequireAuth />, { auth: { user: null } });
    expect(screen.getByText("TRANG DANG NHAP")).toBeInTheDocument();
  });

  it("da dang nhap -> hien noi dung", () => {
    renderGuard(<RequireAuth />, { auth: { user: mockUsers.member } });
    expect(screen.getByText("NOI DUNG BI CHAN")).toBeInTheDocument();
  });
});

describe("RequirePermission", () => {
  it("thieu quyen -> chuyen sang trang 403", () => {
    renderGuard(<RequirePermission permissions={[PERMISSIONS.USER_READ]} />, {
      auth: { user: mockUsers.member },
    });
    expect(screen.getByText("TRANG 403")).toBeInTheDocument();
  });

  it("du quyen -> hien noi dung", () => {
    renderGuard(<RequirePermission permissions={[PERMISSIONS.USER_READ]} />, {
      auth: { user: mockUsers.admin },
    });
    expect(screen.getByText("NOI DUNG BI CHAN")).toBeInTheDocument();
  });

  it("chua dang nhap -> ve trang dang nhap (khong phai 403)", () => {
    renderGuard(<RequirePermission permissions={[PERMISSIONS.USER_READ]} />, {
      auth: { user: null },
    });
    expect(screen.getByText("TRANG DANG NHAP")).toBeInTheDocument();
  });

  it("minRole chan vai tro thap hon", () => {
    renderGuard(<RequirePermission minRole={ROLES.SUPER_ADMIN} />, {
      auth: { user: mockUsers.admin },
    });
    expect(screen.getByText("TRANG 403")).toBeInTheDocument();
  });

  it("minRole cho vai tro cao hon di qua", () => {
    renderGuard(<RequirePermission minRole={ROLES.ADMIN} />, {
      auth: { user: mockUsers.superAdmin },
    });
    expect(screen.getByText("NOI DUNG BI CHAN")).toBeInTheDocument();
  });

  it("ket hop nhieu dieu kien: phai thoa MAN TAT CA", () => {
    renderGuard(
      <RequirePermission permissions={[PERMISSIONS.PRODUCT_READ]} minRole={ROLES.SUPER_ADMIN} />,
      { auth: { user: mockUsers.admin } }, // co quyen doc san pham nhung chua du cap bac
    );
    expect(screen.getByText("TRANG 403")).toBeInTheDocument();
  });

  it("khong khai bao dieu kien nao -> chi can dang nhap", () => {
    renderGuard(<RequirePermission />, { auth: { user: mockUsers.member } });
    expect(screen.getByText("NOI DUNG BI CHAN")).toBeInTheDocument();
  });
});

describe("RequireGuest", () => {
  it("da dang nhap -> day ve trang chu", () => {
    renderGuard(<RequireGuest />, { auth: { user: mockUsers.member } });
    expect(screen.getByText("TRANG CHU")).toBeInTheDocument();
  });

  it("chua dang nhap -> cho vao", () => {
    renderGuard(<RequireGuest />, { auth: { user: null } });
    expect(screen.getByText("NOI DUNG BI CHAN")).toBeInTheDocument();
  });
});
