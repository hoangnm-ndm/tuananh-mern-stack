import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createCrudHooks } from "./createCrudHooks.js";

/**
 * Kiem tra "nha may sinh hook" - phan tai su dung quan trong nhat cua frontend.
 * API duoc gia lap hoan toan; khong co request that nao duoc gui.
 */

const keys = {
  all: ["thing"],
  lists: () => ["thing", "list"],
  list: (params) => ["thing", "list", params],
  details: () => ["thing", "detail"],
  detail: (id) => ["thing", "detail", id],
};

function setup(apiOverrides = {}) {
  const api = {
    list: vi.fn().mockResolvedValue({
      data: [{ id: "1", name: "Mot" }],
      meta: {
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    }),
    getById: vi.fn().mockResolvedValue({ data: { id: "1", name: "Mot" } }),
    create: vi.fn().mockResolvedValue({ data: { id: "2" }, message: "Tao thanh cong" }),
    update: vi
      .fn()
      .mockResolvedValue({ data: { id: "1", name: "Sua" }, message: "Cap nhat thanh cong" }),
    remove: vi.fn().mockResolvedValue({ message: "Xoa thanh cong" }),
    ...apiOverrides,
  };

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });

  const hooks = createCrudHooks({ api, keys, resourceName: "thing" });
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { api, hooks, wrapper, queryClient };
}

describe("createCrudHooks - useList", () => {
  it("boc tach items va pagination tu response", async () => {
    const { hooks, wrapper } = setup();
    const { result } = renderHook(() => hooks.useList({ page: 1 }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.items).toEqual([{ id: "1", name: "Mot" }]);
    expect(result.current.pagination.total).toBe(1);
  });

  it("truyen tham so xuong lop API", async () => {
    const { api, hooks, wrapper } = setup();
    const params = { page: 2, limit: 5, search: "abc" };

    const { result } = renderHook(() => hooks.useList(params), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.list).toHaveBeenCalledWith(params);
  });

  it("tra ve pagination mac dinh an toan khi backend khong gui meta", async () => {
    const { hooks, wrapper } = setup({ list: vi.fn().mockResolvedValue({ data: [] }) });
    const { result } = renderHook(() => hooks.useList({}), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.items).toEqual([]);
    expect(result.current.pagination).toMatchObject({ total: 0, page: 1, totalPages: 0 });
  });
});

describe("createCrudHooks - useDetail", () => {
  it("khong goi API khi chua co id", () => {
    const { api, hooks, wrapper } = setup();
    renderHook(() => hooks.useDetail(undefined), { wrapper });
    expect(api.getById).not.toHaveBeenCalled();
  });

  it("goi API va boc tach item khi co id", async () => {
    const { api, hooks, wrapper } = setup();
    const { result } = renderHook(() => hooks.useDetail("1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.getById).toHaveBeenCalledWith("1");
    expect(result.current.item).toEqual({ id: "1", name: "Mot" });
  });
});

describe("createCrudHooks - cac mutation", () => {
  it("useCreate goi onSuccess kem thong bao tu backend", async () => {
    const onSuccess = vi.fn();
    const { hooks, wrapper } = setup();

    const { result } = renderHook(() => hooks.useCreate({ onSuccess }), { wrapper });
    result.current.mutate({ name: "Moi" });

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ id: "2" }, "Tao thanh cong"));
  });

  it("useCreate vo hieu hoa cache danh sach sau khi tao", async () => {
    const { hooks, wrapper, queryClient } = setup();
    const spy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => hooks.useCreate(), { wrapper });
    result.current.mutate({ name: "Moi" });

    await waitFor(() => expect(spy).toHaveBeenCalledWith({ queryKey: keys.lists() }));
  });

  it("useUpdate tach id khoi payload truoc khi goi API", async () => {
    const { api, hooks, wrapper } = setup();

    const { result } = renderHook(() => hooks.useUpdate(), { wrapper });
    result.current.mutate({ id: "1", name: "Sua" });

    await waitFor(() => expect(api.update).toHaveBeenCalledWith("1", { name: "Sua" }));
  });

  it("useRemove xoa luon cache chi tiet cua ban ghi da xoa", async () => {
    const { hooks, wrapper, queryClient } = setup();
    const spy = vi.spyOn(queryClient, "removeQueries");

    const { result } = renderHook(() => hooks.useRemove(), { wrapper });
    result.current.mutate("1");

    await waitFor(() => expect(spy).toHaveBeenCalledWith({ queryKey: keys.detail("1") }));
  });

  it("goi onError khi API that bai", async () => {
    const onError = vi.fn();
    const error = new Error("That bai");
    const { hooks, wrapper } = setup({ create: vi.fn().mockRejectedValue(error) });

    const { result } = renderHook(() => hooks.useCreate({ onError }), { wrapper });
    result.current.mutate({});

    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});
