import Order from "/models/OrderModel.js";
import Cart from "/models/CartModel.js";

// ✅ Create a new order
export const createOrder = async (req, res) => {
  try {
    const { products, totalAmount } = req.body;

    // create order
    const order = new Order({
      user: req.user._id,
      products,
      totalAmount,
      status: "Pending"
    });

    await order.save();

    // optional: clear user's cart after order
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { products: [] } }
    );

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all orders for logged-in user
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("products.product", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
