import express from "express";
import { createOrder, getOrders } from "/controllers/OrderController.js";
import { protect, isBuyer } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.post("/create", protect, isBuyer, createOrder);

router.get("/", protect, isBuyer, getOrders);

export default router;
