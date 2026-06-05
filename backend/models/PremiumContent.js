import mongoose from "mongoose";

const premiumContentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: ["image", "video", "link"],
      required: true,
    },
    accessPlan: {
      type: String,
      enum: ["images", "videos"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
  },
  { timestamps: true }
);

premiumContentSchema.index({ status: 1, accessPlan: 1, createdAt: -1 });

export default mongoose.model("PremiumContent", premiumContentSchema);