import mongoose from "mongoose";
import { toJSONPlugin } from "../../core/db/plugins/toJSON.js";
import { slugify } from "../../core/utils/slug.js";

/**
 * Model San pham - MODULE MAU.
 * Dung day lam khuon khi tao module nghiep vu moi (bai viet, don hang, danh muc...).
 */
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Ten san pham la bat buoc"],
      trim: true,
      maxlength: [200, "Ten san pham toi da 200 ky tu"],
    },
    slug: { type: String, unique: true, index: true },
    price: {
      type: Number,
      required: [true, "Gia la bat buoc"],
      min: [0, "Gia phai la so khong am"],
    },
    description: { type: String, trim: true, default: "" },
    imageUrl: { type: String, default: null },
    stock: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true },

    /** Nguoi tao - phuc vu quy tac "chi sua ban ghi cua chinh minh". */
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, versionKey: false },
);

productSchema.plugin(toJSONPlugin);

/** Tu sinh slug tu title. Them hau to ngau nhien de tranh trung. */
productSchema.pre("validate", function generateSlug(next) {
  if (this.isModified("title") || !this.slug) {
    const base = slugify(this.title) || "san-pham";
    this.slug = `${base}-${Math.random().toString(36).slice(2, 8)}`;
  }
  next();
});

/** Index phuc vu tim kiem toan van tren ten + mo ta. */
productSchema.index({ title: "text", description: "text" });

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
