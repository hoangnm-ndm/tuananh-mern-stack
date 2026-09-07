import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price must be a positive number"],
    },
    description: {
      type: String,
    },
  },
  {
    versionKey: false, // Disable the __v field
    timestamps: true, // Enable createdAt and updatedAt fields
  },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
