import express from "express";
import { protect, isBuyer } from "../middleware/AuthMiddleware.js";
import { createReview, getReviewById, editReview, deleteReview } from "../controllers/ReviewController.js";

const router = express.Router();

router.route("/")
    .post(protect, isBuyer, createReview);

router.route("/:id")
    .get(getReviewById)
    .put(protect, isBuyer, editReview)
    .delete(protect, isBuyer, deleteReview);

export default router;