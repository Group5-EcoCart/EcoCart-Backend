import mongoose from "mongoose";

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

export default mongoose.model("Payment", paymentSchema);
