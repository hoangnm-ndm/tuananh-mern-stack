import { QueryClient } from "@tanstack/react-query";

/**
 * Cau hinh TanStack Query dung chung.
 *
 * Nhung lua chon dang chu y:
 * - `retry`: KHONG thu lai voi loi 4xx (sai du lieu / khong co quyen - thu lai vo ich).
 * - `staleTime` 60s: trong 1 phut, chuyen tab qua lai khong ban them request.
 * - `throwOnError` = false: loi duoc tra ve qua `error` de component tu hien thi.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry(failureCount, error) {
          const status = error?.status ?? 0;
          if (status >= 400 && status < 500) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export const queryClient = createQueryClient();
