import Payment from "/models/PaymentModel.js";
import Order from "/models/OrderModel.js";

export const makePayment = async (req, res) => {
  try {
    const { orderId, amount, method } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // create payment
    const payment = new Payment({
      user: req.user._id,
      order: orderId,
      amount,
      method,
      status: "Success" // later you can integrate Razorpay/Stripe
    });

    await payment.save();

    // update order status
    order.status = "Paid";
    await order.save();

    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("order")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
