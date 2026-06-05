import PremiumContent from "../models/PremiumContent.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getPremiumContent = asyncHandler(async (req, res) => {
  const items = await PremiumContent.find({ status: "published" }).sort({
    createdAt: -1,
  });

  res.json({
    success: true,
    items,
  });
});

export const createPremiumContent = asyncHandler(async (req, res) => {
  const item = await PremiumContent.create(req.body);

  res.status(201).json({
    success: true,
    item,
  });
});

export const updatePremiumContent = asyncHandler(async (req, res) => {
  const item = await PremiumContent.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!item) {
    return res.status(404).json({
      error: "Premium content not found",
    });
  }

  res.json({
    success: true,
    item,
  });
});

export const deletePremiumContent = asyncHandler(async (req, res) => {
  const item = await PremiumContent.findByIdAndDelete(req.params.id);

  if (!item) {
    return res.status(404).json({
      error: "Premium content not found",
    });
  }

  res.json({
    success: true,
    message: "Premium content deleted",
  });
});