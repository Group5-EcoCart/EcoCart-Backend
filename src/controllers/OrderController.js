import {Cart,Wishlist,Payment,Order} from "../models/OrderSchema.js"
import ProductModel from "../models/productSchema.js";
import UserModel from "../models/userSchema.js"; // Import UserModel
import { sendEmail } from "../utils/emailService.js";
import Razorpay from "razorpay";
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

export const createOrder = async (req, res) => {
    try {
        const { products, totalAmount, address } = req.body;
        const order = new Order({
            user: req.user._id,
            products,
            totalAmount,
            address
        });

        // Process each product in the order
        for (const item of products) {
            // Find the product and decrease its quantity
            const product = await ProductModel.findByIdAndUpdate(
                item.product,
                { $inc: { Quantity: -item.quantity } },
                { new: true }
            ).populate('SellerId'); // <-- This is the crucial fix

            // Check if the product and its seller exist
            if (product && product.SellerId) {
                const seller = product.SellerId;

                // --- 1. Send New Order Notification ---
                if (seller.notificationPreferences && seller.notificationPreferences.newOrders) {
                    const subject = `New Order Received! - #${order._id.toString().slice(-6)}`;
                    const html = `
                        <h1>You have a new order!</h1>
                        <p>An order has been placed for your product: <strong>${product.Title}</strong>.</p>
                        <p>Quantity: ${item.quantity}</p>
                        <p>Please log in to your seller dashboard to process it.</p>
                    `;
                    // The await keyword ensures the email is sent before proceeding
                    await sendEmail(seller.email, subject, html);
                }

                // --- 2. Send Low Stock Alert ---
                const LOW_STOCK_THRESHOLD = 5;
                if (seller.notificationPreferences && seller.notificationPreferences.lowStock && product.Quantity <= LOW_STOCK_THRESHOLD) {
                    const subject = `Low Stock Alert for ${product.Title}`;
                    const html = `
                        <h1>Low Stock Warning!</h1>
                        <p>Your product <strong>${product.Title}</strong> is running low on stock.</p>
                        <p>Current Quantity: ${product.Quantity}</p>
                        <p>Please update your inventory soon.</p>
                    `;
                    await sendEmail(seller.email, subject, html);
                }
            }
        }

        await order.save();
        
        // Clear the user's cart
        await Cart.findOneAndUpdate(
            { user: req.user._id },
            { $set: { products: [] } }
        );

        res.status(201).json(order);
    } catch (err) {
        console.error("Error creating order:", err); // Added for better debugging
        res.status(500).json({ error: err.message });
    }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      // Correctly populate all needed fields from the product and address
      .populate({
        path: "products.product",
        select: "Title Price Images EcoPoints" 
      })
      .populate("address") // Also populate the address details
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Ensure the user owns this order
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to modify this order" });
        }

        // Check if the order status is 'Delivered'
        if (order.status === "Delivered") {
            return res.status(400).json({ message: "Cannot cancel an order that has already been delivered." });
        }

        order.status = "Cancelled";
        await order.save();

        res.status(200).json({ message: "Order has been cancelled successfully.", order });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

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

export const createRazorpayOrder = async (req, res) => {
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_ID_KEY,
            key_secret: process.env.RAZORPAY_SECRET_KEY,
        });

        const options = {
            amount: req.body.amount * 100, // amount in smallest currency unit
            currency: "INR",
            receipt: `receipt_order_${new Date().getTime()}`,
        };

        const order = await instance.orders.create(options);

        if (!order) return res.status(500).send("Some error occured");

        res.json(order);
    } catch (error) {
        res.status(500).send(error);
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