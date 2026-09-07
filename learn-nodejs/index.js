import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import Product from "./src/models/Product.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ message: "Get all products", data: products });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
});

app.post("/products", async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json({ message: "Product created", data: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Error creating product", error });
  }
});

app.put("/products/:id", async () => {});
app.delete("/products/:id", async () => {});
// Lay chi tiet san pham theo id
app.get("/products/:id", async () => {});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
