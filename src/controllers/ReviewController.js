import ReviewModel from "../models/ReviewSchema.js";
import ProductModel from "../models/productSchema.js";
import { Order } from "../models/OrderSchema.js";

export const createReview = async (req, res) => {
    const { productId, rating, review, images } = req.body;

    try {
        const product = await ProductModel.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const deliveredOrder = await Order.findOne({
            user: req.user._id,
            "products.product": productId,
            status: "Delivered",
        });

        if (!deliveredOrder) {
            return res.status(401).json({ message: "You can only review products you have purchased and that have been delivered." });
        }

        const existingReview = await ReviewModel.findOne({
            product: productId,
            user: req.user._id,
        });

        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this product" });
        }

        const newReview = new ReviewModel({
            product: productId,
            user: req.user._id,
            rating,
            review,
            images,
        });

        await newReview.save();

        const reviews = await ReviewModel.find({ product: productId });
        const totalRating = reviews.reduce((acc, item) => item.rating + acc, 0);
        product.rating.average = totalRating / reviews.length;
        product.rating.count = reviews.length;

        await product.save();

        res.status(201).json({ message: "Review added" });
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getReviewById = async (req, res) => {
    try {
        const review = await ReviewModel.findById(req.params.id);

        if (review) {
            res.json(review);
        } else {
            res.status(404).json({ message: "Review not found" });
        }
    } catch (error) {
        console.error("Error fetching review:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const editReview = async (req, res) => {
    const { rating, review, images } = req.body;

    try {
        const reviewToUpdate = await ReviewModel.findById(req.params.id);

        if (!reviewToUpdate) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (reviewToUpdate.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to edit this review" });
        }

        reviewToUpdate.rating = rating || reviewToUpdate.rating;
        reviewToUpdate.review = review || reviewToUpdate.review;
        reviewToUpdate.images = images || reviewToUpdate.images;

        await reviewToUpdate.save();

        const product = await ProductModel.findById(reviewToUpdate.product);
        const reviews = await ReviewModel.find({ product: reviewToUpdate.product });
        const totalRating = reviews.reduce((acc, item) => item.rating + acc, 0);
        product.rating.average = totalRating / reviews.length;
        product.rating.count = reviews.length;

        await product.save();

        res.json({ message: "Review updated successfully" });
    } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const review = await ReviewModel.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to delete this review" });
        }
        const productId = review.product;
        await ReviewModel.findByIdAndDelete(req.params.id);
        const product = await ProductModel.findById(productId);
        const reviews = await ReviewModel.find({ product: productId });

        if (reviews.length > 0) {
            const totalRating = reviews.reduce((acc, item) => item.rating + acc, 0);
            product.rating.average = totalRating / reviews.length;
            product.rating.count = reviews.length;
        } else {
            product.rating.average = 0;
            product.rating.count = 0;
        }

        await product.save();

        res.json({ message: "Review removed" });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getUserReviews = async (req, res) => {
    try {
        const reviews = await ReviewModel.find({ user: req.user._id }).populate('product', 'Title');
        if (reviews) {
            res.json(reviews);
        } else {
            res.status(404).json({ message: "No reviews found for this user" });
        }
    } catch (error) {
        console.error("Error fetching user reviews:", error);
        res.status(500).json({ message: "Server error" });
    }
};