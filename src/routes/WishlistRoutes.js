import express from "express";
import { addToWishlist, getWishlist, removeFromWishlist } from "/controllers/WishlistController.js";
import { protect, isBuyer } from "../middleware/AuthMiddleware.js";

const router = express.Router();


router.post("/add", protect, isBuyer, addToWishlist);


router.get("/", protect, isBuyer, getWishlist);


router.delete("/remove", protect, isBuyer, removeFromWishlist);

export default router;
