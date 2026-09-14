import { BaseRepository } from "../../core/db/BaseRepository.js";
import { User } from "./user.model.js";

/**
 * Repository cua User - ke thua toan bo CRUD tu BaseRepository
 * va bo sung cac truy van dac thu cua nghiep vu xac thuc.
 */
export class UserRepository extends BaseRepository {
  constructor(model = User) {
    super(model);
  }

  /**
   * Tim theo email. `withPassword=true` de lay ca hash password khi dang nhap.
   * (Mac dinh schema da `select: false` nen phai xin ro rang.)
   */
  findByEmail(email, { withPassword = false } = {}) {
    const query = this.model.findOne({ email: String(email).toLowerCase().trim() });
    if (withPassword) query.select("+password");
    return query.exec();
  }

  /** Tim nguoi dung da lien ket voi mot tai khoan ben ngoai (vd: Google sub). */
  findByProvider(providerName, providerId) {
    return this.model.findOne({
      providers: { $elemMatch: { name: providerName, providerId } },
    });
  }

  emailExists(email) {
    return this.exists({ email: String(email).toLowerCase().trim() });
  }

  /** Ghi nhan thoi diem dang nhap gan nhat (khong chan luong dang nhap neu loi). */
  touchLastLogin(userId) {
    return this.model.updateOne({ _id: userId }, { $set: { lastLoginAt: new Date() } });
  }
}

export const userRepository = new UserRepository();
