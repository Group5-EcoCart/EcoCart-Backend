import express from "express";
import { protect, isBuyer } from "../middleware/AuthMiddleware.js";
import {
  addToCart,
  getCart,
  removeFromCart,
  createOrder,
  cancelOrder,
  getOrders,
  makePayment,
  getPayments,
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  createRazorpayOrder
} from "../controllers/OrderController.js"; // Make sure to use the combined controller

const router = express.Router();

// Cart Routes
router.post("/cart/add", protect, isBuyer, addToCart);
router.get("/cart", protect, isBuyer, getCart);
router.delete("/cart/remove", protect, isBuyer, removeFromCart);

// Order Routes
router.post("/orders/create", protect, isBuyer, createOrder);
router.get("/orders", protect, isBuyer, getOrders);
router.put("/orders/:id/cancel", protect, isBuyer, cancelOrder);

// Payment Routes
router.post("/orders/razorpay", protect, isBuyer, createRazorpayOrder);
router.post("/payments/pay", protect, isBuyer, makePayment);
router.get("/payments", protect, isBuyer, getPayments);

// Wishlist Routes
router.post("/wishlist/add", protect, isBuyer, addToWishlist);
router.get("/wishlist", protect, isBuyer, getWishlist);
router.delete("/wishlist/remove", protect, isBuyer, removeFromWishlist);

export default router;