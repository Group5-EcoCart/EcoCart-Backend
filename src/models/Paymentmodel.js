import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: "Pending" },
  method: { type: String, default: "COD" }
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
