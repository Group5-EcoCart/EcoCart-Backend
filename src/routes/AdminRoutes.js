import express from "express";
import { protect, isAdmin } from "../middleware/AuthMiddleware.js";
import {
  getAdminDashboard,
  getAllUsers,
  blockUnblockUser,
  getAllSellers,
  deleteProduct,
  updateOrderStatus,
} from "../controllers/AdminController.js";
import { adminLogin } from "../controllers/AdminAuthController.js";

const router = express.Router();

router.post("/login", adminLogin);

router.get("/dashboard", protect, isAdmin, getAdminDashboard);

router.get("/users", protect, isAdmin, getAllUsers);
router.put("/users/:id/block", protect, isAdmin, blockUnblockUser);
router.get("/sellers", protect, isAdmin, getAllSellers);
router.delete("/products/:id", protect, isAdmin, deleteProduct);
router.put("/orders/:id/status", protect, isAdmin, updateOrderStatus);

export default router;
