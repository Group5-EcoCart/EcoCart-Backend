import express from "express";
import { protect } from "../middleware/AuthMiddleware.js";
import { getAllProducts } from "../controllers/productController.js";

const router = express.Router();
router.route("/")
  .get(protect, getAllProducts);

export default router;