import mongoose from "mongoose";

/*
  Short-lived one-time codes for subscriber email verification.
  The `expiresAt` TTL index makes MongoDB auto-delete expired codes.
*/
const subscriberOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

/* TTL — document removed automatically once expiresAt passes */
subscriberOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("SubscriberOtp", subscriberOtpSchema);
