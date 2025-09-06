import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "products",
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        rating: {
            type: Number,
            required: true,
        },
        review: {
            type: String,
            required: true,
        },
        images: [{
            src: { type: String, required: true },
            alt: { type: String }
        }],
    },
    {
        timestamps: true,
    }
);

const ReviewModel = mongoose.model("Review", reviewSchema);

export default ReviewModel;