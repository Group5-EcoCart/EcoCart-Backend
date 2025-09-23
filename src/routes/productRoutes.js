import express from "express";
import { protect } from "../middleware/AuthMiddleware.js";
import { getAllProducts, getProductById } from "../controllers/ProductController.js";

const router = express.Router();
router.route("/")
  .get(protect, getAllProducts);

router.route("/:id")
  .get(protect, getProductById);

export default router;