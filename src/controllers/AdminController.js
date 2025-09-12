import UserModel from "../models/userSchema.js";
import ProductModel from "../models/productSchema.js";
import { Order } from "../models/OrderSchema.js"; 

const MONTHS_TO_SHOW = 6;

export const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await UserModel.countDocuments({ role: "user" });
    const totalSellers = await UserModel.countDocuments({ role: "seller" });

    const salesData = await Order.aggregate([
      { $match: { status: { $in: ["Processing", "Shipped", "Delivered"] } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = salesData[0]?.totalRevenue || 0;
    const totalOrders = salesData[0]?.totalOrders || 0;

    const now = new Date();
    const pastDate = new Date(now.getFullYear(), now.getMonth() - (MONTHS_TO_SHOW - 1), 1);

    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: pastDate }, status: { $in: ["Processing", "Shipped", "Delivered"] } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const months = [];
    for (let i = MONTHS_TO_SHOW - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString("default", { month: "short", year: "numeric" }) });
    }

    const monthlyRevenueMap = {};
    monthlyRevenue.forEach((m) => {
      monthlyRevenueMap[`${m._id.year}-${m._id.month}`] = { revenue: m.revenue, orders: m.orders };
    });

    const monthlyRevenueSeries = months.map((m) => {
      const key = `${m.year}-${m.month}`;
      const val = monthlyRevenueMap[key] || { revenue: 0, orders: 0 };
      return { label: m.label, year: m.year, month: m.month, revenue: val.revenue, orders: val.orders };
    });

    const orderStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newUsersThisMonth = await UserModel.countDocuments({ createdAt: { $gte: firstOfMonth } });

    const LOW_STOCK_THRESHOLD = 5;
    const lowStockProducts = await ProductModel.find({ stock: { $lte: LOW_STOCK_THRESHOLD } }).limit(10).select("title price stock");

    const topProducts = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalSold: { $sum: "$products.quantity" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          productId: "$productDetails._id",
          title: "$productDetails.title",
          totalSold: 1,
          price: "$productDetails.price",
        },
      },
    ]);

    res.json({
      totalUsers,
      totalSellers,
      totalRevenue,
      totalOrders,
      monthlyRevenue: monthlyRevenueSeries,
      orderStatus,
      newUsersThisMonth,
      lowStockProducts,
      topProducts,
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// PUT /api/admin/users/:id/block  body: { blocked: boolean }
export const blockUnblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { blocked } = req.body;
    const user = await UserModel.findByIdAndUpdate(id, { blocked: !!blocked }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: `User ${blocked ? "blocked" : "unblocked"}`, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/admin/sellers
export const getAllSellers = async (req, res) => {
  try {
    const sellers = await UserModel.find({ role: "seller" }).select("-password").sort({ createdAt: -1 });
    res.json(sellers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE /api/admin/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted", productId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// PUT /api/admin/orders/:id/status  body: { status: "Pending"|"Processing"|"Shipped"|"Delivered"|"Cancelled" }
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
