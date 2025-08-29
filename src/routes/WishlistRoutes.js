import express from "express";
import { addToWishlist, getWishlist, removeFromWishlist } from "../controllers/WishlistController.js";
import { protect } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.post("/add", protect, addToWishlist);
router.get("/", protect, getWishlist);
router.delete("/remove", protect, removeFromWishlist);

export default router;
