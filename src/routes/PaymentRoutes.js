import express from "express";
import { makePayment, getPayments } from "/controllers/PaymentController.js";
import { protect } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.post("/pay", protect, makePayment);
router.get("/", protect, getPayments);

export default router;
