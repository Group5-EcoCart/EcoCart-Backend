import express from "express";
import { protect, isAdmin } from "../middleware/AuthMiddleware.js";
import { getCounts, getSalesAndRevenue, getTopSellingProducts, getSellers, updateSellerStatus } from "../controllers/AdminController.js";

const router = express.Router();

router.get("/counts", protect, isAdmin, getCounts);
router.get("/sales-revenue", protect, isAdmin, getSalesAndRevenue);
router.get("/top-products", protect, isAdmin, getTopSellingProducts);
router.get("/sellers", protect, isAdmin, getSellers);
router.put("/sellers/status", protect, isAdmin, updateSellerStatus);

export default router;