import { compact } from "./pick.js";

/**
 * Chuyen query string cua HTTP thanh tham so truy van MongoDB.
 * Gom 4 tinh nang thuong gap: phan trang, sap xep, tim kiem, loc.
 *
 * Vi du:
 *   GET /products?page=2&limit=10&sort=-price,title&search=ao&minPrice=100
 *   -> { page: 2, limit: 10, skip: 10, sort: { price: -1, title: 1 }, filter: {...} }
 */

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

/** Chuan hoa page/limit -> luon la so nguyen duong, limit bi chan tren. */
export function buildPagination({ page, limit } = {}) {
  const safePage = Math.max(Number.parseInt(page, 10) || DEFAULT_PAGE, 1);
  const parsedLimit = Number.parseInt(limit, 10) || DEFAULT_LIMIT;
  const safeLimit = Math.min(Math.max(parsedLimit, 1), MAX_LIMIT);
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
}

/**
 * "-price,title" -> { price: -1, title: 1 }
 * Chi chap nhan field nam trong allowedFields de tranh sap xep theo field nhay cam.
 */
export function buildSort(
  sortParam,
  { allowedFields = null, defaultSort = { createdAt: -1 } } = {},
) {
  if (!sortParam || typeof sortParam !== "string") return defaultSort;

  const sort = {};
  for (const rawField of sortParam.split(",")) {
    const token = rawField.trim();
    if (!token) continue;
    const descending = token.startsWith("-");
    const field = descending ? token.slice(1) : token;
    if (!field) continue;
    if (allowedFields && !allowedFields.includes(field)) continue;
    sort[field] = descending ? -1 : 1;
  }

  return Object.keys(sort).length ? sort : defaultSort;
}

/** Thoat ky tu dac biet de chuoi nguoi dung nhap khong pha vo regex. */
export function escapeRegex(text = "") {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Tao dieu kien $or tim kiem gan dung (case-insensitive) tren nhieu field. */
export function buildSearch(searchTerm, searchableFields = []) {
  if (!searchTerm || !searchableFields.length) return null;
  const pattern = new RegExp(escapeRegex(String(searchTerm).trim()), "i");
  return { $or: searchableFields.map((field) => ({ [field]: pattern })) };
}

/**
 * Tao filter tu query, chi nhan cac field duoc phep.
 * Ho tro toan tu dang `field_gte`, `field_lte`, `field_ne`, `field_in` (phan cach bang dau phay).
 */
export function buildFilter(query = {}, { allowedFields = [] } = {}) {
  const filter = {};
  const OPERATOR_SUFFIXES = {
    _gte: "$gte",
    _gt: "$gt",
    _lte: "$lte",
    _lt: "$lt",
    _ne: "$ne",
    _in: "$in",
  };

  for (const [rawKey, rawValue] of Object.entries(query)) {
    if (rawValue === undefined || rawValue === null || rawValue === "") continue;

    const suffix = Object.keys(OPERATOR_SUFFIXES).find((s) => rawKey.endsWith(s));
    const field = suffix ? rawKey.slice(0, -suffix.length) : rawKey;
    if (!allowedFields.includes(field)) continue;

    if (!suffix) {
      filter[field] = castValue(rawValue);
      continue;
    }

    const operator = OPERATOR_SUFFIXES[suffix];
    const value =
      operator === "$in"
        ? String(rawValue)
            .split(",")
            .map((v) => castValue(v.trim()))
        : castValue(rawValue);
    filter[field] = { ...(filter[field] ?? {}), [operator]: value };
  }

  return compact(filter);
}

function castValue(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (typeof value === "string" && value !== "" && !Number.isNaN(Number(value)))
    return Number(value);
  return value;
}

/**
 * Ham tong hop: nhan req.query + cau hinh module -> tra ve moi thu can cho repository.
 * @param {object} query req.query
 * @param {object} config
 * @param {string[]} config.searchableFields Field cho phep tim kiem toan van.
 * @param {string[]} config.filterableFields Field cho phep loc.
 * @param {string[]} [config.sortableFields] Field cho phep sap xep (null = cho phep tat ca).
 * @param {object} [config.defaultSort]
 */
export function parseQueryFeatures(query = {}, config = {}) {
  const {
    searchableFields = [],
    filterableFields = [],
    sortableFields = null,
    defaultSort = { createdAt: -1 },
  } = config;

  const { page, limit, skip } = buildPagination(query);
  const sort = buildSort(query.sort, { allowedFields: sortableFields, defaultSort });
  const baseFilter = buildFilter(query, { allowedFields: filterableFields });
  const search = buildSearch(query.search ?? query.q, searchableFields);

  const filter = search ? { ...baseFilter, ...search } : baseFilter;

  return { page, limit, skip, sort, filter };
}
