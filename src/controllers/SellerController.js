import ProductModel from "../models/productSchema.js";
import {Order} from "../models/OrderSchema.js";
import getCarbonFootprint from "./EmissionController.js";

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
    const { Title, Price, Images, Category, Description, Weight, Height, Width, Quantity, Keywords, Status, Size, Color } = req.body;
    
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
            Title,
            Price,
            Images,
            Category,
            Description,
            EcoPoints: ecoPoints,
            CarbonFootPrint: carbonFootprint,
            Weight,
            Height,
            Width,
            Quantity,
            Keywords,
            Status,
            Size,
            Color
        });

        const createdProducts = await product.save();
        return res.status(201).json(createdProducts);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(400).json({ message: "Invalid product data provided.", error: error.message });
    }
}

export const editProduct = async (req, res) => {
    const { id } = req.params;

    try {
        await verifySeller(id, req.user._id);
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        )
        res.status(200).json(updatedProduct)
    } catch (error) {
        console.error("Error updating product:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }
        res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
    }
}

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
            .populate("products.product")
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