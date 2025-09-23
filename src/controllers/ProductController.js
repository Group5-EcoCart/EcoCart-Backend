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

export const getProductById = async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id);
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        res.status(500).json({ message: "Server error while fetching product." });
    }
};