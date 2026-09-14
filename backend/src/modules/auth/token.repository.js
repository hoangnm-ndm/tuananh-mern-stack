import { BaseRepository } from "../../core/db/BaseRepository.js";
import { hashToken } from "../../core/utils/crypto.js";
import { Token } from "./token.model.js";

/** Truy van cho token co trang thai (refresh / magic link). */
export class TokenRepository extends BaseRepository {
  constructor(model = Token) {
    super(model);
  }

  /** Luu token moi (nhan ban RO, tu bam truoc khi luu). */
  issue({ userId, rawToken, type, expiresAt, userAgent, ipAddress }) {
    return this.create({
      user: userId,
      tokenHash: hashToken(rawToken),
      type,
      expiresAt,
      userAgent,
      ipAddress,
    });
  }

  /** Tim token con hieu luc theo ban ro. */
  findUsable(rawToken, type) {
    return this.model.findOne({
      tokenHash: hashToken(rawToken),
      type,
      consumedAt: null,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });
  }

  /** Danh dau da su dung - dung cho magic link (1 lan duy nhat). */
  consume(rawToken, type) {
    return this.model.findOneAndUpdate(
      {
        tokenHash: hashToken(rawToken),
        type,
        consumedAt: null,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      },
      { $set: { consumedAt: new Date() } },
      { new: true },
    );
  }

  revoke(rawToken, type) {
    return this.model.updateOne(
      { tokenHash: hashToken(rawToken), type },
      { $set: { revokedAt: new Date() } },
    );
  }

  /** Thu hoi toan bo token cua mot nguoi dung - "dang xuat khoi moi thiet bi". */
  revokeAllForUser(userId, type) {
    return this.model.updateMany(
      { user: userId, ...(type ? { type } : {}), revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
  }
}

export const tokenRepository = new TokenRepository();
