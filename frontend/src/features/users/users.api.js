import { http } from "@/core/api/client.js";

export const usersApi = {
  list: (params) => http.get("/users", { params }),
  getById: (id) => http.get(`/users/${id}`),
  create: (payload) => http.post("/users", payload),
  update: (id, payload) => http.patch(`/users/${id}`, payload),
  remove: (id) => http.delete(`/users/${id}`),

  // Cac thao tac rieng cua module nguoi dung
  changeRole: (id, role) => http.patch(`/users/${id}/role`, { role }),
  setActiveStatus: (id, isActive) => http.patch(`/users/${id}/status`, { isActive }),
};
