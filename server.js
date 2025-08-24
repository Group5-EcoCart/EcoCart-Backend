import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/AuthRoutes.js";
import sellerProducts  from "./src/routes/SellerRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import userRoutes from "./src/routes/UserRouts.js";
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
 
app.use("/api/auth",authRoutes);

app.use("/api/seller",sellerProducts);

app.use("/api/products", productRoutes);

app.use("/api/user",userRoutes);
const PORT = process.env.PORT;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
}); 