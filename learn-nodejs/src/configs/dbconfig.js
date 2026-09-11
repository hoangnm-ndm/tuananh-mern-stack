import mongoose from "mongoose";
import env from "./envconfig.js";

function connectDB() {
  mongoose
    .connect(env.DB_URI)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
    });
}

export default connectDB;
