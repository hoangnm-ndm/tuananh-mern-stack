import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useDebounce } from "./useDebounce.js";
import { DEFAULT_PAGE_SIZE } from "../config/constants.js";

/**
 * Quan ly toan bo trang thai cua mot bang du lieu: trang, so dong, tim kiem, sap xep, loc.
 *
 * Diem cot loi: trang thai duoc luu tren URL (query string).
 * Nho vay:
 *  - Nguoi dung F5 khong mat bo loc dang xem.
 *  - Chia se duong dan la nguoi khac thay dung ket qua do.
 *  - Nut Back/Forward cua trinh duyet hoat dong dung nhu mong doi.
 *
 * `search` duoc debounce -> go phim khong ban request lien tuc.
 *
 * @example
 * const table = useTableQuery({ defaultSort: "-createdAt" });
 * const { data } = useProducts(table.queryParams);
 */
export function useTableQuery({
  defaultLimit = DEFAULT_PAGE_SIZE,
  defaultSort = "-createdAt",
  defaultFilters = {},
  searchDebounceMs = 400,
} = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Input tim kiem giu state rieng de go phim khong giat (URL chi cap nhat sau debounce)
  const [searchInput, setSearchInput] = useState(() => searchParams.get("search") ?? "");
  const debouncedSearch = useDebounce(searchInput, searchDebounceMs);

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || defaultLimit;
  const sort = searchParams.get("sort") ?? defaultSort;

  /** Cac tham so loc (moi thu khong phai page/limit/sort/search). */
  const filters = useMemo(() => {
    const reserved = new Set(["page", "limit", "sort", "search"]);
    const result = { ...defaultFilters };
    for (const [key, value] of searchParams.entries()) {
      if (!reserved.has(key)) result[key] = value;
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- defaultFilters la hang so cua noi goi
  }, [searchParams]);

  /** Ghi de mot phan query string, giu lai phan con lai. */
  const patchParams = useCallback(
    (patch, { resetPage = true } = {}) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);

          for (const [key, value] of Object.entries(patch)) {
            if (value === undefined || value === null || value === "") next.delete(key);
            else next.set(key, String(value));
          }

          // Doi bo loc thi phai ve trang 1, neu khong se roi vao trang rong
          if (resetPage && !("page" in patch)) next.set("page", "1");

          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setPage = useCallback(
    (nextPage) => patchParams({ page: nextPage }, { resetPage: false }),
    [patchParams],
  );
  const setLimit = useCallback((nextLimit) => patchParams({ limit: nextLimit }), [patchParams]);
  const setFilter = useCallback((key, value) => patchParams({ [key]: value }), [patchParams]);

  /** Bam lai cung mot cot se dao chieu sap xep. */
  const toggleSort = useCallback(
    (field) => {
      const isDescending = sort === `-${field}`;
      patchParams({ sort: isDescending ? field : `-${field}` });
    },
    [sort, patchParams],
  );

  const resetAll = useCallback(() => {
    setSearchInput("");
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  /**
   * Dong bo tu khoa da debounce len URL.
   * Phai nam trong useEffect: cap nhat URL la mot hieu ung phu (side effect),
   * goi thang trong than component se gay vong lap render vo tan.
   */
  const search = debouncedSearch.trim();
  const currentSearchParam = searchParams.get("search") ?? "";

  useEffect(() => {
    if (currentSearchParam !== search) patchParams({ search });
  }, [search, currentSearchParam, patchParams]);

  /** Doi tuong truyen thang vao hook goi API. */
  const queryParams = useMemo(
    () => ({ page, limit, sort, ...(search ? { search } : {}), ...filters }),
    [page, limit, sort, search, filters],
  );

  return {
    // gia tri hien tai
    page,
    limit,
    sort,
    search,
    searchInput,
    filters,
    queryParams,

    // ham dieu khien
    setSearchInput,
    setPage,
    setLimit,
    setFilter,
    toggleSort,
    patchParams,
    resetAll,

    /** Tien ich cho header bang: biet cot nao dang sap xep va theo chieu nao. */
    getSortDirection: (field) => (sort === field ? "asc" : sort === `-${field}` ? "desc" : null),
  };
}
