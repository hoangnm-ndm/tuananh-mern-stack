/**
 * Query key tap trung - tranh go chuoi tu do khap noi.
 *
 * Cau truc phan cap cho phep vo hieu hoa (invalidate) theo tung muc:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.products.all })  -> moi query san pham
 *   queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id) }) -> chi 1 san pham
 */
export const queryKeys = {
  auth: {
    all: ["auth"],
    me: () => [...queryKeys.auth.all, "me"],
  },

  products: {
    all: ["products"],
    lists: () => [...queryKeys.products.all, "list"],
    list: (params) => [...queryKeys.products.lists(), params],
    details: () => [...queryKeys.products.all, "detail"],
    detail: (id) => [...queryKeys.products.details(), id],
  },

  users: {
    all: ["users"],
    lists: () => [...queryKeys.users.all, "list"],
    list: (params) => [...queryKeys.users.lists(), params],
    details: () => [...queryKeys.users.all, "detail"],
    detail: (id) => [...queryKeys.users.details(), id],
  },
};
