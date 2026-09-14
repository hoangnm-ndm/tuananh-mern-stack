import { useQuery } from "@tanstack/react-query";
import { createCrudHooks } from "@/core/hooks/createCrudHooks.js";
import { queryKeys } from "@/core/query/queryKeys.js";
import { productsApi } from "./products.api.js";

/**
 * CUSTOM HOOK cua module san pham.
 *
 * Toan bo 5 hook CRUD duoc SINH RA tu `createCrudHooks` - khong phai viet lai
 * logic cache, invalidate, thong bao. Chi bo sung cac truy van dac thu ben duoi.
 *
 * Day chinh la khuon mau cho MOI module nghiep vu moi: sao chep file nay,
 * doi `productsApi` va `queryKeys.products` la xong.
 */
const productHooks = createCrudHooks({
  api: productsApi,
  keys: queryKeys.products,
  resourceName: "san pham",
});

export const {
  useList: useProducts,
  useDetail: useProduct,
  useCreate: useCreateProduct,
  useUpdate: useUpdateProduct,
  useRemove: useDeleteProduct,
} = productHooks;

// ---------------------------------------------------------------------------
// Cac truy van rieng cua module (khong nam trong bo CRUD chuan)
// ---------------------------------------------------------------------------

/** Danh sach cong khai - dung cho trang khach, khong can dang nhap. */
export function usePublicProducts(params = {}) {
  const query = useQuery({
    queryKey: [...queryKeys.products.lists(), "public", params],
    queryFn: () => productsApi.listPublic(params),
    placeholderData: (previous) => previous,
  });

  return {
    ...query,
    items: query.data?.data ?? [],
    pagination: query.data?.meta?.pagination ?? {
      total: 0,
      page: 1,
      limit: params.limit ?? 10,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };
}

/** Chi tiet theo slug - dung cho URL thang than thien voi SEO. */
export function useProductBySlug(slug) {
  const query = useQuery({
    queryKey: [...queryKeys.products.details(), "slug", slug],
    queryFn: () => productsApi.getBySlug(slug),
    enabled: Boolean(slug),
  });

  return { ...query, item: query.data?.data ?? null };
}
