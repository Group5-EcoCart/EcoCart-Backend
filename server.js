import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/AuthRoutes.js"
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
 
// for auth
app.use("/api/auth",authRoutes);


const PORT = process.env.PORT;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
}); 