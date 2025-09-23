// // backend/upload.js
// import express from "express";
// import multer from "multer";
// import { v2 as cloudinary } from "cloudinary";

// const router = express.Router();
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// cloudinary.config({
//   cloud_name: "dmduoq4tg",
//   api_key: "725571562441696",
//   api_secret: "buVCKvDbYHw501oiJg72GhTBxOI",
// });

// router.post("/upload", upload.single("image"), async (req, res) => {
//   try {
//     const b64 = Buffer.from(req.file.buffer).toString("base64");
//     const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

//     const result = await cloudinary.uploader.upload(dataURI, {
//       folder: "mern_uploads", // optional
//     });
//     res.json({ imageUrl: result.secure_url });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;
