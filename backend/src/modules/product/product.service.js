import { BaseService } from "../../core/service/BaseService.js";
import { productRepository } from "./product.repository.js";

/**
 * Toan bo CRUD + phan trang + tim kiem + loc den tu BaseService.
 * Chi can khai bao field nao duoc tim kiem / loc / sap xep.
 */
export class ProductService extends BaseService {
  constructor(repository = productRepository) {
    super(repository, {
      resourceName: "San pham",
      searchableFields: ["title", "description"],
      filterableFields: ["price", "isActive", "stock", "createdBy"],
      sortableFields: ["createdAt", "price", "title", "stock"],
      defaultSort: { createdAt: -1 },
    });
  }

  /** Vi du bo sung nghiep vu rieng: chi lay san pham dang ban (dung cho trang cong khai). */
  listPublic(query = {}) {
    return this.list(query, { extraFilter: { isActive: true } });
  }

  findBySlug(slug) {
    return this.repository.findOne({ slug });
  }
}

export const productService = new ProductService();
