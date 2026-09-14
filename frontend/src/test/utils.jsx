import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router";
import { AuthContext } from "@/core/auth/AuthContext.js";
import { ToastProvider } from "@/core/hooks/ToastProvider.jsx";
import { ROLES } from "@/core/config/constants.js";

/**
 * Cong cu render dung chung cho test.
 * Tu boc day du Provider de component duoc test gan giong luc chay that.
 */

/** QueryClient rieng cho tung test: tat retry va cache de ket qua on dinh. */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

/** Tao gia tri AuthContext gia lap. */
export function createAuthValue({
  user = null,
  isInitializing = false,
  permissions = null,
  ...rest
} = {}) {
  return {
    user,
    isAuthenticated: Boolean(user),
    isInitializing,
    permissions: permissions ?? user?.permissions ?? [],
    applySession: vi.fn(),
    clearSession: vi.fn(),
    setUser: vi.fn(),
    logout: vi.fn(),
    ...rest,
  };
}

export const mockUsers = {
  member: {
    id: "u1",
    name: "Thanh Vien",
    email: "member@example.com",
    role: ROLES.MEMBER,
    permissions: ["product:read"],
  },
  admin: {
    id: "u2",
    name: "Quan Tri",
    email: "admin@example.com",
    role: ROLES.ADMIN,
    permissions: [
      "product:read",
      "product:create",
      "product:update",
      "product:delete",
      "user:read",
      "user:update",
    ],
  },
  superAdmin: {
    id: "u3",
    name: "Sieu Quan Tri",
    email: "super@example.com",
    role: ROLES.SUPER_ADMIN,
    permissions: [
      "product:read",
      "product:create",
      "product:update",
      "product:delete",
      "user:read",
      "user:create",
      "user:update",
      "user:delete",
      "user:manage-role",
      "system:settings",
    ],
  },
};

/**
 * Render mot component kem day du Provider.
 * @param {React.ReactNode} ui
 * @param {object} options
 * @param {object} [options.auth] Gia tri AuthContext gia lap.
 * @param {string[]} [options.initialEntries] Duong dan khoi tao cua router.
 */
export function renderWithProviders(
  ui,
  { auth = {}, initialEntries = ["/"], ...renderOptions } = {},
) {
  const queryClient = createTestQueryClient();
  const authValue = createAuthValue(auth);

  const router = createMemoryRouter([{ path: "*", element: ui }], { initialEntries });

  const result = render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthContext.Provider value={authValue}>
          <RouterProvider router={router} />
        </AuthContext.Provider>
      </ToastProvider>
    </QueryClientProvider>,
    renderOptions,
  );

  return { ...result, queryClient, authValue, router };
}

/** Render hook kem Provider (dung cho test cac custom hook). */
export function createHookWrapper({ auth = {}, initialEntries = ["/"] } = {}) {
  const queryClient = createTestQueryClient();
  const authValue = createAuthValue(auth);

  function Wrapper({ children }) {
    const router = createMemoryRouter([{ path: "*", element: children }], { initialEntries });
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthContext.Provider value={authValue}>
            <RouterProvider router={router} />
          </AuthContext.Provider>
        </ToastProvider>
      </QueryClientProvider>
    );
  }

  return { Wrapper, queryClient, authValue };
}
