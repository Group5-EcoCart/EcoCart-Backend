import Order from "/models/orderModel.js";

export const createOrder = async (req, res) => {
  try {
    const { products, totalAmount } = req.body;
    const order = new Order({ user: req.user._id, products, totalAmount });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("products.product");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
