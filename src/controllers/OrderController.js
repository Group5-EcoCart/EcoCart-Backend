import {Cart,Wishlist,Payment,Order} from "../models/OrderSchema.js"

// Cart Controller Logic
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity, mode = 'add' } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      const newCart = new Cart({ user: req.user._id, products: [{ product: productId, quantity }] });
      await newCart.save();
      return res.status(200).json(newCart);
    }
    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex > -1) {
      if (mode === 'set') {
        cart.products[productIndex].quantity = quantity;
      } else {
        cart.products[productIndex].quantity += quantity;
      }
      if (cart.products[productIndex].quantity <= 0) {
        cart.products.splice(productIndex, 1);
      }

    } else {
      if (quantity > 0) {
        cart.products.push({ product: productId, quantity });
      }
    }

    await cart.save();
    res.status(200).json(cart);

  } catch (err) {
    res.status(500).json({ message: "Error updating cart", error: err.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("products.product");
    res.status(200).json(cart || { products: [] });
  } catch (err) {
    res.status(500).json({ message: "Error fetching cart", error: err.message });
  }
};
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter(
      (item) => item.product.toString() !== productId
    );
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: "Error removing from cart", error: err.message });
  }
};

// Order Controller Logic
export const createOrder = async (req, res) => {
  try {
    const { products, totalAmount } = req.body;
    const order = new Order({
      user: req.user._id,
      products,
      totalAmount,
      status: "Pending"
    });
    await order.save();
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { products: [] } }
    );
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

// Payment Controller Logic
export const makePayment = async (req, res) => {
  try {
    const { orderId, amount, method } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Forbidden: You can only pay for your own orders." });
    }
    const payment = new Payment({
      user: req.user._id,
      order: orderId,
      amount,
      method,
      status: "Success"
    });
    await payment.save();
    order.status = "Processing";
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

// Wishlist Controller Logic
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }
    const productExists = wishlist.products.some(
      (item) => item.product.toString() === productId
    );

    if (!productExists) {
      wishlist.products.push({ product: productId });
    }
    await wishlist.save();
    res.status(200).json(wishlist);
  } catch (err) {
    res.status(500).json({ message: "Error adding to wishlist", error: err.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products.product");
    res.status(200).json(wishlist);
  } catch (err) {
    res.status(500).json({ message: "Error fetching wishlist", error: err.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }
    wishlist.products = wishlist.products.filter(
      (item) => item.product.toString() !== productId
    );
    await wishlist.save();
    res.status(200).json(wishlist);
  } catch (err) {
    res.status(500).json({ message: "Error removing from wishlist", error: err.message });
  }
};