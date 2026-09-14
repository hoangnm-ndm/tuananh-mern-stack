import mongoose from "mongoose";
import { toJSONPlugin } from "../../core/db/plugins/toJSON.js";
import { ROLES, ROLE_VALUES } from "../../core/constants/roles.js";
import { AUTH_PROVIDERS } from "../../core/constants/auth.js";
import { hashPassword } from "../../core/utils/password.js";

/**
 * Model nguoi dung - trung tam cua ca 3 phuong thuc dang nhap.
 *
 * Mot tai khoan co the co NHIEU provider (vd: dang ky bang email, sau do lien ket Google).
 * `providers[]` ghi lai cac phuong thuc da lien ket; `password` chi ton tai voi provider "local".
 */
const providerSchema = new mongoose.Schema(
  {
    name: { type: String, enum: Object.values(AUTH_PROVIDERS), required: true },
    /** Id cua nguoi dung ben phia nha cung cap (vd: Google `sub`). */
    providerId: { type: String },
    linkedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email la bat buoc"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: [true, "Ten la bat buoc"], trim: true },

    /**
     * `select: false` -> mac dinh KHONG tra ve khi query.
     * `private: true`  -> plugin toJSON xoa han khoi output JSON.
     * Muon lay password phai chu dong: User.findOne().select("+password")
     */
    password: { type: String, select: false, private: true },

    avatarUrl: { type: String, default: null },

    role: {
      type: String,
      enum: { values: ROLE_VALUES, message: "Vai tro khong hop le" },
      default: ROLES.MEMBER,
      index: true,
    },

    providers: { type: [providerSchema], default: [] },

    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

userSchema.plugin(toJSONPlugin);

/** Tu dong bam mat khau truoc khi luu (chi khi password thay doi). */
userSchema.pre("save", async function hashPasswordIfChanged(next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await hashPassword(this.password);
  return next();
});

/** Kiem tra nguoi dung co lien ket provider nao do chua. */
userSchema.methods.hasProvider = function hasProvider(providerName) {
  return this.providers.some((provider) => provider.name === providerName);
};

/** Index phuc vu tra cuu nguoi dung theo provider ngoai (Google). */
userSchema.index({ "providers.name": 1, "providers.providerId": 1 });

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
