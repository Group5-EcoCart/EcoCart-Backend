import mongoose from "mongoose";


const productSchema = mongoose.Schema(
    {
        SellerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        Title: { type: String, required: true },
        Price: { type: Number, required: true },
        Images: [{
            src: { type: String, required: true },
            alt: { type: String }
        }],
        Category: { type: String, required: true },
        CarbonFootPrint: { type: Number },
        EcoPoints: { type: Number, required: true },
        Description: { type: String, required: true },
        Size: { type: String },
        Color: { type: String },
        Weight: { type: Number, required: true },
        Height: { type: Number, required: true },
        Width: { type: Number, required: true },
        Quantity: { type: Number, required: true, default: 0 },
        rating: {
            average: { type: Number, default: 0 },
            count: { type: Number, default: 0 }
        },
        Keywords: [String],
        Status: { type: String, required: true }
    }, {
    timestamps: true
}
);

const ProductModel = mongoose.model("products", productSchema);

export default ProductModel;