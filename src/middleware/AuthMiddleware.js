import jwt from "jsonwebtoken";
import UserModel from "../models/userSchema.js";

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await UserModel.findById(decoded.id).select("-password");

            next();
        } catch (err) {
            console.log(err);
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    }
    if (!token) {
        return res.status(401).json({ message: "Not authorized, No token" })
    }
};

export const isSeller = (req, res, next) => {
    if (req.user && req.user.role === 'seller' && req.user.status === 'approved') {
        next();
    } else {
        res.status(401).json({ message: "Not authorized as a seller" });
    }
};

export const isBuyer = (req, res, next) => {
    if (req.user && req.user.role === 'buyer') {
        next();
    } else {
        res.status(401).json({ message: "Not authorized as a buyer" });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: "Not authorized as an admin" });
    }
};