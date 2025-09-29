import mongoose from "mongoose";

// Cart Model
const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        // FIX: Changed ref to "products"
        product: { type: mongoose.Schema.Types.ObjectId, ref: "products", required: true },
        quantity: { type: Number, default: 1, min: 1 }
      }
    ]
  },
  { timestamps: true } 
);
export const Cart = mongoose.model("Cart", cartSchema);

// Order Model
const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "products", required: true },
        quantity: { type: Number, required: true },
        // Add status to each product
        status: { type: String, enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"], default: "Pending" }
      }
    ],
    totalAmount: { type: Number, required: true },
    address: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" }
  },
  { timestamps: true }
);
export const Order = mongoose.model("Order", orderSchema);

// Payment Model
const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["COD", "Card", "UPI", "NetBanking"], required: true },
    status: { type: String, enum: ["Pending", "Success", "Failed"], default: "Pending" },
    transactionId: { type: String }
  },
  { timestamps: true }
);
export const Payment = mongoose.model("Payment", paymentSchema);

// Wishlist Model
const wishlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        // FIX: Changed ref to "products"
        product: { type: mongoose.Schema.Types.ObjectId, ref: "products", required: true }
      }
    ]
  },
  { timestamps: true }
);
export const Wishlist = mongoose.model("Wishlist", wishlistSchema);