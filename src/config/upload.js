import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from 'streamifier';
import { protect } from "../middleware/AuthMiddleware.js";

const router = express.Router();

// NOTE: The cloudinary.config() call has been removed from this file.

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", protect, upload.array("images", 5), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No images uploaded." });
    }

    const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "ecocart_products" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve({ src: result.secure_url, alt: file.originalname });
                }
            );
            streamifier.createReadStream(file.buffer).pipe(stream);
        });
    });

    try {
        const results = await Promise.all(uploadPromises);
        res.status(200).json(results);
    } catch (err) {
        console.error("Cloudinary Upload Error:", err);
        res.status(500).json({ message: "Error uploading to Cloudinary.", error: err.message });
    }
});

export default router;