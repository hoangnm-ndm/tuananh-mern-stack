import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./src/configs/dbconfig.js";
import routes from "./src/routes/index.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.use("/api", routes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
