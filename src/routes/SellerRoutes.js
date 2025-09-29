import express from "express";
import { isSeller,protect } from "../middleware/AuthMiddleware.js";
import { getProducts,createProduct,editProduct,deleteProduct,getSellerOrders, updateProductStatus,updateOrderStatus,getDashboardStats, getAnalytics,getSellerReviews } from "../controllers/SellerController.js";
import { getWarehouses, addWarehouse, updateWarehouse, deleteWarehouse } from "../controllers/WarehouseController.js";

const router = express.Router();


router.route("/")
  .get(protect, isSeller, getProducts)
  .post(protect, isSeller, createProduct);

router.route("/:id")
  .put(protect, isSeller, editProduct)
  .delete(protect, isSeller, deleteProduct);

router.route("/orders")
  .get(protect, isSeller, getSellerOrders);

router.route("/orders/:orderId")
  .put(protect, isSeller, updateOrderStatus);

router.route("/dashboard-stats")
    .get(protect, isSeller, getDashboardStats);

router.route("/analytics")
    .get(protect, isSeller, getAnalytics);
router.route("/reviews")
    .get(protect, isSeller, getSellerReviews);

router.route("/warehouses")
    .get(protect, isSeller, getWarehouses)
    .post(protect, isSeller, addWarehouse);

router.route("/warehouses/:id")
    .put(protect, isSeller, updateWarehouse)
    .delete(protect, isSeller, deleteWarehouse);

router.route("/orders/:orderId/products/:productId")
  .put(protect, isSeller, updateProductStatus);

  export default router;