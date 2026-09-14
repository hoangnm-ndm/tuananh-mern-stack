import { BaseService } from "../../core/service/BaseService.js";
import { AppError, ERROR_CODES } from "../../core/errors/index.js";
import { ROLES, ROLE_LEVEL } from "../../core/constants/roles.js";
import { AUTH_PROVIDERS } from "../../core/constants/auth.js";
import { comparePassword, hashPassword } from "../../core/utils/password.js";
import { userRepository } from "./user.repository.js";

/**
 * UserService - nghiep vu nguoi dung.
 * Ke thua BaseService de co san list/getById/create/update/remove,
 * bo sung cac thao tac rieng (doi mat khau, doi vai tro, lien ket provider...).
 */
export class UserService extends BaseService {
  constructor(repository = userRepository) {
    super(repository, {
      resourceName: "Nguoi dung",
      searchableFields: ["name", "email"],
      filterableFields: ["role", "isActive", "isEmailVerified", "createdAt"],
      sortableFields: ["createdAt", "name", "email", "lastLoginAt"],
    });
  }

  findByEmail(email, options) {
    return this.repository.findByEmail(email, options);
  }

  /**
   * Tao nguoi dung moi voi mat khau (dang ky local).
   * Kiem tra trung email TRUOC de tra loi 409 ro nghia thay vi loi unique index.
   */
  async createWithPassword({ email, password, name, role = ROLES.MEMBER }) {
    if (await this.repository.emailExists(email)) {
      throw AppError.conflict("Email da duoc su dung", ERROR_CODES.EMAIL_ALREADY_EXISTS);
    }

    return this.repository.create({
      email,
      password,
      name,
      role,
      providers: [{ name: AUTH_PROVIDERS.LOCAL }],
    });
  }

  /**
   * Tim hoac tao nguoi dung tu nha cung cap ngoai (Google / magic link).
   * Neu email da ton tai -> LIEN KET them provider thay vi tao tai khoan trung.
   */
  async findOrCreateByProvider({
    email,
    name,
    avatarUrl,
    provider,
    providerId,
    isEmailVerified = true,
  }) {
    const existing = await this.repository.findByEmail(email);

    if (existing) {
      const alreadyLinked = existing.providers.some(
        (item) => item.name === provider && (!providerId || item.providerId === providerId),
      );

      if (!alreadyLinked) {
        existing.providers.push({ name: provider, providerId });
      }
      if (isEmailVerified && !existing.isEmailVerified) existing.isEmailVerified = true;
      if (avatarUrl && !existing.avatarUrl) existing.avatarUrl = avatarUrl;

      await existing.save();
      return { user: existing, isNewUser: false };
    }

    const created = await this.repository.create({
      email,
      name: name || email.split("@")[0],
      avatarUrl,
      isEmailVerified,
      providers: [{ name: provider, providerId }],
    });

    return { user: created, isNewUser: true };
  }

  /** Doi mat khau: bat buoc xac minh mat khau cu. */
  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await this.repository.model.findById(userId).select("+password");
    if (!user) throw AppError.notFound("Nguoi dung khong ton tai");

    if (!user.password) {
      throw AppError.badRequest(
        "Tai khoan nay dang nhap bang Google/Magic link nen chua co mat khau. Hay dung chuc nang dat mat khau.",
        undefined,
        ERROR_CODES.PROVIDER_MISMATCH,
      );
    }

    const matched = await comparePassword(currentPassword, user.password);
    if (!matched) {
      throw AppError.badRequest(
        "Mat khau hien tai khong dung",
        undefined,
        ERROR_CODES.INVALID_CREDENTIALS,
      );
    }

    user.password = newPassword; // hook pre("save") se tu bam
    await user.save();
    return true;
  }

  /** Dat mat khau truc tiep (dung cho luong quen mat khau / tai khoan OAuth chua co mat khau). */
  async setPassword(userId, newPassword) {
    const hashed = await hashPassword(newPassword);
    const updated = await this.repository.updateById(userId, {
      password: hashed,
      $addToSet: { providers: { name: AUTH_PROVIDERS.LOCAL } },
    });
    if (!updated) throw AppError.notFound("Nguoi dung khong ton tai");
    return true;
  }

  /**
   * Doi vai tro nguoi dung.
   * Quy tac an toan: khong ai duoc cap vai tro CAO HON chinh minh,
   * va khong ai duoc tu ha vai tro cua chinh minh (tranh khoa mat he thong).
   */
  async changeRole(targetUserId, newRole, actor) {
    if (String(targetUserId) === String(actor.id ?? actor._id)) {
      throw AppError.forbidden("Ban khong the tu thay doi vai tro cua chinh minh");
    }

    const actorLevel = ROLE_LEVEL[actor.role] ?? 0;
    if ((ROLE_LEVEL[newRole] ?? 0) > actorLevel) {
      throw AppError.forbidden("Ban khong the cap vai tro cao hon vai tro cua chinh minh");
    }

    const target = await this.getById(targetUserId);
    if ((ROLE_LEVEL[target.role] ?? 0) > actorLevel) {
      throw AppError.forbidden("Ban khong the thay doi vai tro cua nguoi co quyen cao hon");
    }

    return this.update(targetUserId, { role: newRole });
  }

  /** Khoa / mo khoa tai khoan. */
  async setActiveStatus(userId, isActive, actor) {
    if (String(userId) === String(actor.id ?? actor._id)) {
      throw AppError.forbidden("Ban khong the tu khoa tai khoan cua chinh minh");
    }
    return this.update(userId, { isActive });
  }

  markEmailVerified(userId) {
    return this.repository.updateById(userId, { isEmailVerified: true });
  }

  touchLastLogin(userId) {
    return this.repository.touchLastLogin(userId);
  }
}

export const userService = new UserService();
