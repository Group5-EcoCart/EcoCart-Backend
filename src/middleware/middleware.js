import jwt from "jsonwebtoken";
import UserModel from "../models/userSchema.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request (remove password)
      req.user = await UserModel.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }
    } catch (err) {
      console.error("Auth error:", err);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};


export const isSeller = (req, res, next) => {
  if (req.user && req.user.role === "seller") {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as a seller" });
  }
};

export const isBuyer = (req, res, next) => {
  if (req.user && req.user.role === "user") {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as a buyer" });
  }
};
