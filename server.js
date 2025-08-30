import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";

// Import your routes
import cartRoutes from "/src/routes/cartRoutes.js";
import orderRoutes from "/src/routes/orderRoutes.js";
import paymentRoutes from "/src/routes/paymentRoutes.js";
import wishlistRoutes from "/src/routes/wishlistRoutes.js";


dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/wishlist", wishlistRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
