import { AppError } from "../errors/index.js";
import { parseQueryFeatures } from "../utils/queryFeatures.js";

/**
 * BaseService - lop nghiep vu dung chung cho cac module CRUD.
 *
 * Trach nhiem: rang buoc nghiep vu + dich "khong tim thay" thanh AppError.
 * KHONG biet gi ve req/res (de test thang, khong can Express).
 *
 * Cach dung:
 *   class ProductService extends BaseService {
 *     constructor() {
 *       super(productRepository, {
 *         resourceName: "San pham",
 *         searchableFields: ["title", "description"],
 *         filterableFields: ["price", "isActive"],
 *       });
 *     }
 *     // ghi de / bo sung phuong thuc rieng tai day
 *   }
 */
export class BaseService {
  /**
   * @param {import("../db/BaseRepository.js").BaseRepository} repository
   * @param {object} [options]
   * @param {string} [options.resourceName] Ten hien thi trong thong bao loi.
   * @param {string[]} [options.searchableFields]
   * @param {string[]} [options.filterableFields]
   * @param {string[]} [options.sortableFields]
   * @param {object} [options.defaultSort]
   */
  constructor(repository, options = {}) {
    if (!repository) throw new Error("BaseService yeu cau mot repository");
    this.repository = repository;
    this.resourceName = options.resourceName ?? "Ban ghi";
    this.queryConfig = {
      searchableFields: options.searchableFields ?? [],
      filterableFields: options.filterableFields ?? [],
      sortableFields: options.sortableFields ?? null,
      defaultSort: options.defaultSort ?? { createdAt: -1 },
    };
  }

  /** Danh sach co phan trang / tim kiem / loc / sap xep tu req.query. */
  async list(query = {}, { extraFilter = {}, select, populate } = {}) {
    const { page, limit, skip, sort, filter } = parseQueryFeatures(query, this.queryConfig);
    return this.repository.paginate({
      filter: { ...filter, ...extraFilter },
      sort,
      page,
      limit,
      skip,
      select,
      populate,
    });
  }

  /** Lay 1 ban ghi theo id, nem 404 neu khong co. */
  async getById(id, options = {}) {
    const document = await this.repository.findById(id, options);
    if (!document) throw AppError.notFound(`${this.resourceName} khong ton tai`);
    return document;
  }

  async create(data) {
    return this.repository.create(data);
  }

  async update(id, data) {
    const updated = await this.repository.updateById(id, data);
    if (!updated) throw AppError.notFound(`${this.resourceName} khong ton tai`);
    return updated;
  }

  async remove(id) {
    const deleted = await this.repository.deleteById(id);
    if (!deleted) throw AppError.notFound(`${this.resourceName} khong ton tai`);
    return deleted;
  }
}
