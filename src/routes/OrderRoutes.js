import express from "express";
import { createOrder, getOrders } from "/controllers/OrderController.js";
import { protect } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.post("/create", protect, createOrder);
router.get("/", protect, getOrders);

export default router;
