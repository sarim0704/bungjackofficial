import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    subscriberName: {
      type: String,
      trim: true,
    },
    subscriberEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    plan: {
      type: String,
      enum: ["images", "videos"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ["USD", "CAD", "THB"],
      default: "USD",
    },
    status: {
      type: String,
      enum: ["pending", "active", "cancelled", "expired"],
      default: "pending",
    },
    provider: {
      type: String,
      default: "stripe",
    },
    stripeSessionId: {
      type: String,
      index: true,
    },
    stripeCustomerId: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);