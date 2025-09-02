import express from "express";
import { isSeller,protect } from "../middleware/AuthMiddleware.js";
import { getProducts,createProduct,editProduct,deleteProduct,getSellerOrders,updateOrderStatus } from "../controllers/SellerController.js";

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

  export default router;