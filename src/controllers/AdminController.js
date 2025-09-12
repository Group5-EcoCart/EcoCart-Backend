import UserModel from "../models/userSchema.js";
import { Order } from "../models/OrderSchema.js";
import ProductModel from "../models/productSchema.js";

export const getCounts = async (req, res) => {
    try {
        const userCount = await UserModel.countDocuments({ role: 'buyer' });
        const sellerCount = await UserModel.countDocuments({ role: 'seller' });
        res.json({ users: userCount, sellers: sellerCount });
    } catch (error) {
        res.status(500).json({ message: "Error fetching counts", error: error.message });
    }
};

export const getSalesAndRevenue = async (req, res) => {
    try {
        const orders = await Order.find({});
        const totalSales = orders.length;
        const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
        res.json({ totalSales, totalRevenue });
    } catch (error) {
        res.status(500).json({ message: "Error fetching sales and revenue", error: error.message });
    }
};

export const getTopSellingProducts = async (req, res) => {
    try {
        const topProducts = await Order.aggregate([
            { $unwind: "$products" },
            {
                $group: {
                    _id: "$products.product",
                    totalQuantity: { $sum: "$products.quantity" }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" }
        ]);
        res.json(topProducts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching top selling products", error: error.message });
    }
};

export const getSellers = async (req, res) => {
    try {
        const sellers = await UserModel.find({ role: 'seller' });
        res.json(sellers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching sellers", error: error.message });
    }
};

export const updateSellerStatus = async (req, res) => {
    try {
        const { sellerId, status } = req.body;
        const seller = await UserModel.findById(sellerId);

        if (seller && seller.role === 'seller') {
            seller.status = status;
            await seller.save();
            res.json({ message: `Seller has been ${status}` });
        } else {
            res.status(404).json({ message: "Seller not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error updating seller status", error: error.message });
    }
};