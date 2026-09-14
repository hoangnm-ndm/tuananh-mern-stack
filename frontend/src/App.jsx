import { RouterProvider } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/core/auth/AuthProvider.jsx";
import { ToastProvider } from "@/core/hooks/ToastProvider.jsx";
import { queryClient } from "@/core/query/queryClient.js";
import { router } from "@/routes/index.jsx";

/**
 * Goc cua ung dung - chi lam MOT viec: lap cac Provider theo dung thu tu.
 *
 * Thu tu quan trong:
 *   QueryClientProvider  (ngoai cung - AuthProvider co the dung cache)
 *     └ ToastProvider    (AuthProvider va cac hook can bao loi)
 *       └ AuthProvider   (router can biet trang thai dang nhap de chan duong)
 *         └ RouterProvider
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
