import express from "express";
import { makePayment, getPayments } from "/controllers/PaymentController.js";
import { protect, isBuyer } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.post("/pay", protect, isBuyer, makePayment);


router.get("/", protect, isBuyer, getPayments);

export default router;
