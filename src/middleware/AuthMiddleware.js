import jwt from "jsonwebtoken";
import UserModel from "../models/userSchema.js";
import AdminModel from "../models/AdminSchema.js"; 

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role && decoded.role === "admin") {
        req.user = await AdminModel.findById(decoded.id).select("-password");
        if (req.user) {
          req.user.role = "admin"; 
        }
      } else {
        req.user = await UserModel.findById(decoded.id).select("-password");
      }

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      next();
    } catch (err) {
      console.error("Auth error:", err);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Seller guard
export const isSeller = (req, res, next) => {
  if (req.user && req.user.role === "seller") {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as a seller" });
  }
};

// Buyer guard
export const isBuyer = (req, res, next) => {
  if (req.user && req.user.role === "buyer") {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as a buyer" });
  }
};

// Admin guard
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as an admin" });
  }
};
