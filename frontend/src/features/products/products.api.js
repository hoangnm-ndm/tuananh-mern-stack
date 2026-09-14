import { http } from "@/core/api/client.js";

/**
 * Lop goi API san pham.
 *
 * 5 phuong thuc list/getById/create/update/remove la "hop dong" ma
 * `createCrudHooks` mong doi -> co du 5 ham nay la co ngay bo hook CRUD.
 */
export const productsApi = {
  list: (params) => http.get("/products", { params }),
  listPublic: (params) => http.get("/products/public", { params }),
  getById: (id) => http.get(`/products/${id}`),
  getBySlug: (slug) => http.get(`/products/slug/${slug}`),
  create: (payload) => http.post("/products", payload),
  update: (id, payload) => http.patch(`/products/${id}`, payload),
  remove: (id) => http.delete(`/products/${id}`),
};
