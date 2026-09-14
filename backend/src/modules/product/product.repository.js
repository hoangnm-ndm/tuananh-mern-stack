import { BaseRepository } from "../../core/db/BaseRepository.js";
import { Product } from "./product.model.js";

/**
 * Khong co truy van dac thu -> chi can khoi tao BaseRepository.
 * Khi nao can query rieng thi doi thanh `class ProductRepository extends BaseRepository`.
 */
export const productRepository = new BaseRepository(Product);
