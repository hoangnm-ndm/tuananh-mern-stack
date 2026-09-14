import mongoose from "mongoose";

/**
 * BaseRepository - lop truy cap du lieu dung chung cho MOI Mongoose model.
 *
 * Vi sao can repository?
 * - Service khong phu thuoc truc tiep vao Mongoose -> doi ORM/DB it anh huong.
 * - Gom logic lap lai (phan trang, dem tong, upsert...) vao 1 cho.
 *
 * Cach dung:
 *   const userRepository = new BaseRepository(UserModel);
 *   // hoac ke thua de them truy van rieng:
 *   class UserRepository extends BaseRepository {
 *     findByEmail(email) { return this.findOne({ email }); }
 *   }
 */
export class BaseRepository {
  /** @param {import("mongoose").Model} model */
  constructor(model) {
    if (!model) throw new Error("BaseRepository yeu cau mot Mongoose model");
    this.model = model;
  }

  /** Kiem tra chuoi co phai ObjectId hop le khong. */
  static isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  }

  create(data) {
    return this.model.create(data);
  }

  createMany(items) {
    return this.model.insertMany(items);
  }

  findById(id, { select, populate, lean = false } = {}) {
    if (!BaseRepository.isValidId(id)) return Promise.resolve(null);
    return this.#applyOptions(this.model.findById(id), { select, populate, lean });
  }

  findOne(filter = {}, { select, populate, lean = false } = {}) {
    return this.#applyOptions(this.model.findOne(filter), { select, populate, lean });
  }

  find(filter = {}, { select, populate, sort, skip, limit, lean = true } = {}) {
    let query = this.model.find(filter);
    if (sort) query = query.sort(sort);
    if (typeof skip === "number") query = query.skip(skip);
    if (typeof limit === "number") query = query.limit(limit);
    return this.#applyOptions(query, { select, populate, lean });
  }

  count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  exists(filter = {}) {
    return this.model.exists(filter).then(Boolean);
  }

  /**
   * Truy van co phan trang. Chay dem va lay danh sach SONG SONG de giam do tre.
   * @returns {Promise<{items: any[], total: number, page: number, limit: number}>}
   */
  async paginate({
    filter = {},
    sort = { createdAt: -1 },
    page = 1,
    limit = 10,
    skip,
    select,
    populate,
    lean = true,
  } = {}) {
    const safeSkip = typeof skip === "number" ? skip : (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.find(filter, { sort, skip: safeSkip, limit, select, populate, lean }),
      this.count(filter),
    ]);

    return { items, total, page, limit };
  }

  updateById(id, data, { returnNew = true, runValidators = true } = {}) {
    if (!BaseRepository.isValidId(id)) return Promise.resolve(null);
    return this.model.findByIdAndUpdate(id, data, { new: returnNew, runValidators });
  }

  updateOne(filter, data, options = {}) {
    return this.model.findOneAndUpdate(filter, data, {
      new: true,
      runValidators: true,
      ...options,
    });
  }

  updateMany(filter, data) {
    return this.model.updateMany(filter, data);
  }

  deleteById(id) {
    if (!BaseRepository.isValidId(id)) return Promise.resolve(null);
    return this.model.findByIdAndDelete(id);
  }

  deleteOne(filter) {
    return this.model.findOneAndDelete(filter);
  }

  deleteMany(filter) {
    return this.model.deleteMany(filter);
  }

  /** Tao neu chua co, cap nhat neu da co. */
  upsert(filter, data) {
    return this.model.findOneAndUpdate(filter, data, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    });
  }

  aggregate(pipeline) {
    return this.model.aggregate(pipeline);
  }

  #applyOptions(query, { select, populate, lean }) {
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    if (lean) query = query.lean({ virtuals: true });
    return query.exec();
  }
}
