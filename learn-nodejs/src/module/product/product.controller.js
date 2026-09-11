import Product from "./product.model.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ message: "Get all products", data: products });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

export const createProduct = async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json({ message: "Product created", data: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Error creating product", error });
  }
};
