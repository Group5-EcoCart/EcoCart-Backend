import ProductModel from "../models/productSchema.js";


export const getAllProducts = async (req, res) => {
    try {
        const products = await ProductModel.find({});
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching all products:", error);
        res.status(500).json({ message: "Server error while fetching products." });
    }
};