import Payment from "/models/paymentModel.js";

export const makePayment = async (req, res) => {
  try {
    const { orderId, amount, method } = req.body;
    const payment = new Payment({ user: req.user._id, order: orderId, amount, method, status: "Success" });
    await payment.save();
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).populate("order");
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
