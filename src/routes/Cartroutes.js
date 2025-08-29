import express from "express";
import { addToCart, getCart } from "/controllers/CartController.js";
import { protect } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.post("/add", protect, addToCart);
router.get("/", protect, getCart);

export default router;
