import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * SINH SAN bo hook CRUD hoan chinh cho mot tai nguyen bat ky.
 *
 * Day la trai tim cua viec "tai su dung" o frontend: mot module CRUD moi
 * chi can ~5 dong thay vi viet lai 5 hook giong het nhau.
 *
 * Da xu ly san:
 *  - Vo hieu hoa cache dung cho sau moi lan tao/sua/xoa.
 *  - Ghi thang chi tiet vua lay duoc vao cache (nguoi dung bam vao xem thay ngay).
 *  - Goi `onSuccess` / `onError` de noi goi hien thong bao.
 *
 * @param {object} options
 * @param {object} options.api      Doi tuong co { list, getById, create, update, remove }.
 * @param {object} options.keys     Nhom query key (xem core/query/queryKeys.js).
 * @param {string} options.resourceName Ten hien thi trong thong bao mac dinh.
 *
 * @example
 * const productHooks = createCrudHooks({ api: productApi, keys: queryKeys.products, resourceName: "san pham" });
 * export const { useList: useProducts, useCreate: useCreateProduct } = productHooks;
 */
export function createCrudHooks({ api, keys, resourceName = "ban ghi" }) {
  /** Danh sach co phan trang. */
  function useList(params = {}, options = {}) {
    const query = useQuery({
      queryKey: keys.list(params),
      queryFn: () => api.list(params),
      /** Giu du lieu trang cu trong luc tai trang moi -> bang khong bi "nhay" trang. */
      placeholderData: (previous) => previous,
      ...options,
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

  /** Chi tiet mot ban ghi. */
  function useDetail(id, options = {}) {
    const query = useQuery({
      queryKey: keys.detail(id),
      queryFn: () => api.getById(id),
      enabled: Boolean(id), // chua co id thi khong goi API
      ...options,
    });

    return { ...query, item: query.data?.data ?? null };
  }

  /** Tao moi. */
  function useCreate({ onSuccess, onError } = {}) {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (payload) => api.create(payload),
      onSuccess: (response) => {
        // Moi danh sach deu co the da doi -> tai lai
        queryClient.invalidateQueries({ queryKey: keys.lists() });
        onSuccess?.(response.data, response.message ?? `Tao ${resourceName} thanh cong`);
      },
      onError: (error) => onError?.(error),
    });
  }

  /** Cap nhat. */
  function useUpdate({ onSuccess, onError } = {}) {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ id, ...payload }) => api.update(id, payload),
      onSuccess: (response, variables) => {
        queryClient.invalidateQueries({ queryKey: keys.lists() });
        // Ghi thang ban moi vao cache chi tiet -> khong can goi lai API
        queryClient.setQueryData(keys.detail(variables.id), response);
        onSuccess?.(response.data, response.message ?? `Cap nhat ${resourceName} thanh cong`);
      },
      onError: (error) => onError?.(error),
    });
  }

  /** Xoa. */
  function useRemove({ onSuccess, onError } = {}) {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (id) => api.remove(id),
      onSuccess: (response, id) => {
        queryClient.invalidateQueries({ queryKey: keys.lists() });
        queryClient.removeQueries({ queryKey: keys.detail(id) });
        onSuccess?.(id, response?.message ?? `Xoa ${resourceName} thanh cong`);
      },
      onError: (error) => onError?.(error),
    });
  }

  return { useList, useDetail, useCreate, useUpdate, useRemove };
}
