import express from "express";
import { addToCart, getCart } from "/controllers/CartController.js";
import { protect, isBuyer } from "../middleware/AuthMiddleware.js";

const router = express.Router();


router.post("/add", protect, isBuyer, addToCart);


router.get("/", protect, isBuyer, getCart);

export default router;
