import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";

import MainLayout from "@/layouts/MainLayout.jsx";
import AdminLayout from "@/layouts/AdminLayout.jsx";
import AuthLayout from "@/layouts/AuthLayout.jsx";

import { RequireAuth, RequireGuest, RequirePermission } from "@/core/router/guards.jsx";
import { PATHS } from "@/core/router/paths.js";
import { PERMISSIONS, ROLES } from "@/core/config/constants.js";
import { FullPageSpinner } from "@/core/components/ui/Spinner.jsx";

import HomePage from "@/pages/HomePage.jsx";
import NotFoundPage from "@/pages/NotFoundPage.jsx";
import ForbiddenPage from "@/pages/ForbiddenPage.jsx";
import ErrorPage from "@/pages/ErrorPage.jsx";

/**
 * ROUTES TAP TRUNG - toan bo so do duong di cua ung dung o mot file.
 *
 * Dung `createBrowserRouter` (khong dung <Routes> long trong JSX) vi:
 *  - Cau hinh la DU LIEU -> doc duoc, sinh menu tu day duoc, test duoc.
 *  - Mo khoa cac tinh nang cua Data Router: loader, action, errorElement.
 *  - Tach hoan toan dinh tuyen khoi giao dien.
 *
 * Cau truc phan tang:
 *   Layout -> Guard (chan quyen) -> Trang
 *
 * Cac trang nang (khu quan tri) duoc TAI LUOI (lazy) de goi JS ban dau nho hon:
 * nguoi dung thuong khong bao gio vao /admin thi khong phai tai code cua no.
 */

// ---------- Trang tai luoi ----------
const ProductListPage = lazy(() => import("@/features/products/pages/ProductListPage.jsx"));
const ProductDetailPage = lazy(() => import("@/features/products/pages/ProductDetailPage.jsx"));
const AboutPage = lazy(() => import("@/pages/AboutPage.jsx"));
const ContactPage = lazy(() => import("@/pages/ContactPage.jsx"));

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage.jsx"));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage.jsx"));
const MagicLinkCallbackPage = lazy(() => import("@/features/auth/pages/MagicLinkCallbackPage.jsx"));
const OAuthCallbackPage = lazy(() => import("@/features/auth/pages/OAuthCallbackPage.jsx"));
const ProfilePage = lazy(() => import("@/features/auth/pages/ProfilePage.jsx"));

const DashboardPage = lazy(() => import("@/pages/DashboardPage.jsx"));
const ProductManagementPage = lazy(
  () => import("@/features/products/pages/ProductManagementPage.jsx"),
);
const UserManagementPage = lazy(() => import("@/features/users/pages/UserManagementPage.jsx"));

/** Boc Suspense cho tung trang tai luoi. */
const lazyPage = (element) => <Suspense fallback={<FullPageSpinner />}>{element}</Suspense>;

export const routes = [
  // =========================================================================
  // 1. KHU VUC CONG KHAI
  // =========================================================================
  {
    path: PATHS.HOME,
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: PATHS.PRODUCTS, element: lazyPage(<ProductListPage />) },
      { path: PATHS.PRODUCT_DETAIL, element: lazyPage(<ProductDetailPage />) },
      { path: PATHS.ABOUT, element: lazyPage(<AboutPage />) },
      { path: PATHS.CONTACT, element: lazyPage(<ContactPage />) },
      { path: PATHS.FORBIDDEN, element: <ForbiddenPage /> },

      // Can dang nhap, nhung van dung bo cuc cong khai
      {
        element: <RequireAuth />,
        children: [{ path: PATHS.PROFILE, element: lazyPage(<ProfilePage />) }],
      },
    ],
  },

  // =========================================================================
  // 2. KHU VUC XAC THUC (chi danh cho khach chua dang nhap)
  // =========================================================================
  {
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <RequireGuest />,
        children: [
          { path: PATHS.LOGIN, element: lazyPage(<LoginPage />) },
          { path: PATHS.REGISTER, element: lazyPage(<RegisterPage />) },
        ],
      },
      // Cac trang callback KHONG boc RequireGuest: chung chay ngay luc
      // phien dang duoc thiet lap, chan lai se lam hong luong dang nhap.
      { path: PATHS.MAGIC_LINK_CALLBACK, element: lazyPage(<MagicLinkCallbackPage />) },
      { path: PATHS.OAUTH_CALLBACK, element: lazyPage(<OAuthCallbackPage />) },
    ],
  },

  // =========================================================================
  // 3. KHU VUC QUAN TRI (tu admin tro len)
  // =========================================================================
  {
    path: PATHS.ADMIN,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <RequirePermission minRole={ROLES.ADMIN} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: lazyPage(<DashboardPage />) },
              {
                path: PATHS.ADMIN_PRODUCTS,
                element: <RequirePermission permissions={[PERMISSIONS.PRODUCT_READ]} />,
                children: [{ index: true, element: lazyPage(<ProductManagementPage />) }],
              },
              {
                path: PATHS.ADMIN_USERS,
                element: <RequirePermission permissions={[PERMISSIONS.USER_READ]} />,
                children: [{ index: true, element: lazyPage(<UserManagementPage />) }],
              },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 4. KHONG KHOP DUONG DAN NAO
  // =========================================================================
  { path: PATHS.NOT_FOUND, element: <NotFoundPage /> },
];

/** Tach ham tao router de test co the dung createMemoryRouter voi cung `routes`. */
export function createAppRouter() {
  return createBrowserRouter(routes);
}

export const router = createAppRouter();
