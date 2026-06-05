import express from "express";
import {
  createSubscriptionCheckoutSession,
  getMySubscription,
  getSubscriberContent,
  verifySubscription,
  requestSubscriberOtp,
  verifySubscriberOtp,
  getSubscriberSession,
  logoutSubscriber,
} from "../controllers/subscriptionController.js";
import { subscriptionLimiter, otpLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";
import { subscriptionSchema } from "../schemas/schemas.js";
import { captchaGuard } from "../utils/verifyCaptcha.js";

const router = express.Router();

router.post(
  "/create-checkout-session",
  subscriptionLimiter,
  captchaGuard,
  validate(subscriptionSchema),
  createSubscriptionCheckoutSession
);

/* ── Email OTP verification flow ── */
router.post("/request-otp", otpLimiter, captchaGuard, requestSubscriberOtp);
router.post("/verify-otp", otpLimiter, verifySubscriberOtp);
router.get("/session", getSubscriberSession);
router.post("/logout", logoutSubscriber);

/* Premium content — now gated by the verified subscriber cookie */
router.get("/content", getSubscriberContent);

/* Legacy status check (kept for compatibility; returns plan name only) */
router.get("/me", getMySubscription);
router.get("/verify/:sessionId", verifySubscription);

export default router;
