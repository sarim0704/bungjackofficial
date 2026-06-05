import jwt from "jsonwebtoken";

import Admin from "../models/Admin.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.admin_token;

  if (!token) {
    return res.status(401).json({
      error: "Not authorized. No token found.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({
        error: "Not authorized. Admin not found.",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Token invalid or expired.",
    });
  }
});

export const adminOnly = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      error: "Not authorized.",
    });
  }

  if (!["superadmin", "admin", "editor"].includes(req.admin.role)) {
    return res.status(403).json({
      error: "Forbidden. Admin access required.",
    });
  }

  next();
};