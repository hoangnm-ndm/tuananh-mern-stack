import mongoose from "mongoose";
import { toJSONPlugin } from "../../core/db/plugins/toJSON.js";
import { TOKEN_TYPES } from "../../core/constants/auth.js";

/**
 * Luu cac token co trang thai (stateful) trong DB: refresh token va magic link token.
 *
 * Vi sao phai luu?
 * - JWT tu no KHONG the thu hoi. Luu lai hash cho phep "dang xuat khoi moi thiet bi",
 *   phat hien tai su dung token (token reuse) va vo hieu hoa magic link sau 1 lan dung.
 * - LUON luu HASH, khong luu ban ro: DB bi lo cung khong dung de dang nhap duoc.
 *
 * TTL index tu dong xoa ban ghi het han -> khong can cron don dep.
 */
const tokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    /** SHA-256 cua token goc. */
    tokenHash: { type: String, required: true, unique: true, index: true },

    type: {
      type: String,
      enum: Object.values(TOKEN_TYPES),
      required: true,
      index: true,
    },

    expiresAt: { type: Date, required: true },

    /** Thoi diem token bi thu hoi hoac da su dung (magic link chi dung duoc 1 lan). */
    consumedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },

    /** Metadata phuc vu dieu tra bao mat. */
    userAgent: { type: String, default: null },
    ipAddress: { type: String, default: null },
  },
  { timestamps: true, versionKey: false },
);

tokenSchema.plugin(toJSONPlugin);

// MongoDB tu xoa ban ghi khi qua expiresAt
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/** Token con dung duoc khong? */
tokenSchema.methods.isUsable = function isUsable() {
  return !this.consumedAt && !this.revokedAt && this.expiresAt.getTime() > Date.now();
};

export const Token = mongoose.models.Token || mongoose.model("Token", tokenSchema);
export default Token;
