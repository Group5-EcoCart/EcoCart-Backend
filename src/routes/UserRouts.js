import express from "express";
import { protect } from "../middleware/AuthMiddleware.js";
import {getAddress,editAddress,deleteAddress,addAddress} from "../controllers/AddressController.js"
const router = express.Router();

router.route("/address")
  .get(protect, getAddress)
  .post(protect, addAddress);

router.route("/address/:id")
  .put(protect, editAddress)
  .delete(protect, deleteAddress);


export default router;