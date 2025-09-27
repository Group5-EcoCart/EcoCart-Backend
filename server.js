import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/AuthRoutes.js";
import sellerProducts from "./src/routes/SellerRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import userRoutes from "./src/routes/UserRouts.js";
import orderRoutes from "./src/routes/OrderRoutes.js";
import reviewRoutes from "./src/routes/ReviewRoutes.js";
import adminRoutes from "./src/routes/AdminRoutes.js";
import uploadRoutes from "./src/config/upload.js";

dotenv.config();
connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/seller", sellerProducts);
app.use("/api/products", productRoutes);
app.use("/api/buyer", orderRoutes);
app.use("/api/user", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", uploadRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});