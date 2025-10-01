import mongoose from "mongoose";
import ProductModel from "../models/productSchema.js";
import {Order} from "../models/OrderSchema.js";
import getCarbonFootprint from "./EmissionController.js";
import ReviewModel from "../models/ReviewSchema.js";
import { sendEmail } from "../utils/emailService.js"; // Make sure this is imported
import UserModel from "../models/userSchema.js";

const checkStockAndNotify = async (productId, sellerId) => {
    try {
        const seller = await UserModel.findById(sellerId);
        const product = await ProductModel.findById(productId);

        if (!product || !seller) return;

        const LOW_STOCK_THRESHOLD = 5;
        if (seller.notificationPreferences?.lowStock && product.Quantity > 0 && product.Quantity <= LOW_STOCK_THRESHOLD) {
            const subject = `Low Stock Alert for ${product.Title}`;
            const html = `
                <h1>Low Stock Warning!</h1>
                <p>Your product <strong>${product.Title}</strong> has a low stock level.</p>
                <p>Current Quantity: ${product.Quantity}</p>
                <p>Please consider restocking soon.</p>
            `;
            await sendEmail(seller.email, subject, html);
        }
    } catch (error) {
        console.error("Error in checkStockAndNotify:", error);
    }
};

export const updateProductStatus = async (req, res) => {
    try {
        const { orderId, productId } = req.params;
        const { status } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const productInOrder = order.products.find(p => p.product.toString() === productId);

        if (!productInOrder) {
            return res.status(404).json({ message: "Product not found in this order" });
        }

        productInOrder.status = status;
        await order.save();

        res.status(200).json({ message: "Product status updated successfully", order });

    } catch (error) {
        res.status(500).json({ message: "Error updating product status", error: error.message });
    }
};

const verifySeller = async (id, userId) => {
    const product = await ProductModel.findById(id);

    if (!product) {
        const error = new Error("Product not found");
        error.statusCode = 404;
        throw error;
    }

    if (product.SellerId.toString() !== userId.toString()) {
        const error = new Error("Not authorized to perform this action");
        error.statusCode = 401;
        throw error;
    }
}
export const getProducts = async (req, res) => {
    try {
        const products = await ProductModel.find({ SellerId: req.user._id });
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Server error while fetching products." });
    }
}

export const createProduct = async (req, res) => {
    const { Title, Price, Images, Category, Description, Weight, Height, Width, Quantity, Keywords, Status, Size, Color, warehouse } = req.body;
    
    let carbonFootprint = 0;
    let ecoPoints = 0;

    try {
        carbonFootprint = await getCarbonFootprint(Category, Price);
        if (carbonFootprint) {
            const MAX_ECO_POINTS = 1000;
            ecoPoints = Math.round(MAX_ECO_POINTS / (1 + carbonFootprint));
            ecoPoints = Math.min(ecoPoints, MAX_ECO_POINTS);
        }
    } catch (apiError) {
        console.error("Error calculating carbon footprint:", apiError.message);
    }

    try {
        const product = new ProductModel({
            SellerId: req.user._id,
            Title, Price, Images, Category, Description, EcoPoints: ecoPoints, CarbonFootPrint: carbonFootprint,
            Weight, Height, Width, Quantity, Keywords, Status, Size, Color, warehouse
        });

        const createdProduct = await product.save();

        // --- ADD THIS LINE ---
        // Instantly check stock after creating the product
        await checkStockAndNotify(createdProduct._id, req.user._id);

        return res.status(201).json(createdProduct);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(400).json({ message: "Invalid product data provided.", error: error.message });
    }
};

export const editProduct = async (req, res) => {
    const { id } = req.params;

    try {
        await verifySeller(id, req.user._id);
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        // --- ADD THIS LINE ---
        // Instantly check stock after updating the product
        await checkStockAndNotify(updatedProduct._id, req.user._id);

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error("Error updating product:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }
        res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
    }
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await verifySeller(id, req.user._id);
        await ProductModel.findByIdAndDelete(id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }
        res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
    }
}

export const getSellerOrders = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const products = await ProductModel.find({ SellerId: sellerId });
        const productIds = products.map(p => p._id);

        const orders = await Order.find({ "products.product": { $in: productIds } })
            // --- MODIFICATION: Populate warehouse details for each product ---
            .populate({
                path: "products.product",
                populate: {
                    path: 'warehouse'
                }
            })
            .populate("user", "email");

        let totalSales = 0;
        const sellerOrders = orders.map(order => {
            const sellerProductsInOrder = order.products.filter(p => productIds.some(id => id.equals(p.product._id)));
            let orderTotal = 0;
            sellerProductsInOrder.forEach(p => {
                const price = p.product.Price || 0;
                orderTotal += price * p.quantity;
            });
            totalSales += orderTotal;
            return {
                ...order.toObject(),
                products: sellerProductsInOrder,
                orderTotal
            };
        }).filter(order => order.products.length > 0);
        const totalProfit = totalSales * 0.20;

        res.status(200).json({
            orders: sellerOrders,
            totalSales,
            totalProfit
        });
    } catch (error) {
        console.error("Error fetching seller orders:", error);
        res.status(500).json({ message: "Server error while fetching orders." });
    }
};

export const updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    try {
        const order = await Order.findById(orderId).populate("products.product");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        const sellerProductInOrder = order.products.some(p => p.product.SellerId.equals(req.user._id));
        if (!sellerProductInOrder) {
            return res.status(401).json({ message: "Not authorized to update this order" });
        }

        order.status = status;
        await order.save();
        res.status(200).json(order);
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const sellerId = req.user._id;

        // --- Data Fetching ---
        const allProducts = await ProductModel.find({ SellerId: sellerId });
        const productIds = allProducts.map(p => p._id);
        const allOrders = await Order.find({ "products.product": { $in: productIds } }).populate("products.product");

        let totalCarbonFootprintFromDeliveredOrders = 0;
        let totalQuantityOfProductsInDeliveredOrders = 0;

        allOrders.forEach(order => {
            order.products.forEach(item => {
                if (item.product && productIds.some(id => id.equals(item.product._id)) && item.status === 'Delivered') {
                    totalCarbonFootprintFromDeliveredOrders += (item.product.CarbonFootPrint || 0) * item.quantity;
                    totalQuantityOfProductsInDeliveredOrders += item.quantity;
                }
            });
        });

        const avgCarbon = totalQuantityOfProductsInDeliveredOrders > 0
            ? totalCarbonFootprintFromDeliveredOrders / totalQuantityOfProductsInDeliveredOrders
            : 0;
        
        const activeOrdersCount = allOrders.filter(order =>
            order.products.some(p => ['Processing', 'Shipped'].includes(p.status))
        ).length;

        // --- Final Response Payload ---
        res.status(200).json({
            keyMetrics: {
                totalProducts: allProducts.length,
                activeOrders: activeOrdersCount,
                revenue: allOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0),
                avgCarbon: avgCarbon
            }
        });

    } catch (error) {
        console.error("Error fetching seller dashboard stats:", error);
        res.status(500).json({ message: "Server error while fetching dashboard stats." });
    }
};

export const getAnalytics = async (req, res) => {
    try {
        const sellerId = req.user._id;

        const analytics = await ProductModel.aggregate([
            // Step 1: Match only products belonging to the current seller
            { $match: { SellerId: new mongoose.Types.ObjectId(sellerId) } },
            
            // Step 2: Lookup orders to find sales data for each product
            {
                $lookup: {
                    from: "orders",
                    let: { productId: "$_id" },
                    pipeline: [
                        { $unwind: "$products" },
                        // FIX: Only match products that have been successfully delivered
                        { $match: { 
                            $expr: { 
                                $and: [
                                    { $eq: ["$products.product", "$$productId"] },
                                    { $eq: ["$products.status", "Delivered"] }
                                ]
                            } 
                        } },
                        { $group: {
                            _id: "$products.product",
                            unitsSold: { $sum: "$products.quantity" },
                        }}
                    ],
                    as: "sales"
                }
            },
            
            // Step 3: Reshape the data for the final output
            {
                $project: {
                    Title: 1,
                    salesData: { $arrayElemAt: ["$sales", 0] },
                    rating: 1,
                    EcoPoints: 1,
                    CarbonFootPrint: 1,
                    Price: 1
                }
            },
            {
                $addFields:{
                    "unitsSold": { $ifNull: ["$salesData.unitsSold", 0] },
                    "totalEcoPoints": { $multiply: [{ $ifNull: ["$salesData.unitsSold", 0] }, "$EcoPoints"] },
                    "totalCarbon": { $multiply: [{ $ifNull: ["$salesData.unitsSold", 0] }, "$CarbonFootPrint"] },
                    "totalRevenue": { $multiply: [{ $ifNull: ["$salesData.unitsSold", 0] }, "$Price"] }
                }
            }
        ]);
        
        res.status(200).json(analytics);

    } catch (error) {
        console.error("Error fetching seller analytics:", error);
        res.status(500).json({ message: "Server error while fetching analytics." });
    }
};

export const getSellerReviews = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const products = await ProductModel.find({ SellerId: sellerId }).select('_id');
        const productIds = products.map(p => p._id);
        const reviews = await ReviewModel.find({ product: { $in: productIds } })
            .populate('product', 'Title')
            .populate('user', 'email')
            .sort({ createdAt: -1 });
            
        res.status(200).json(reviews);

    } catch (error) {
        console.error("Error fetching seller reviews:", error);
        res.status(500).json({ message: "Server error while fetching reviews." });
    }
};