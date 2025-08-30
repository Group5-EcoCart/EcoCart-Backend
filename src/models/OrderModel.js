import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true }
      }
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"], default: "Pending" },
    address: { type: mongoose.Schema.Types.ObjectId, ref: "Address" }, // optional shipping address
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" } // link to payment
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
