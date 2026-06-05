import crypto from "crypto";
import jwt from "jsonwebtoken";
import Subscription from "../models/Subscription.js";
import PremiumContent from "../models/PremiumContent.js";
import SubscriberOtp from "../models/SubscriberOtp.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getStripe } from "../config/stripe.js";
import { sendEmail } from "../utils/sendEmail.js";

/* ── OTP helpers ───────────────────────────────────────── */
const hashCode = (code) => crypto.createHash("sha256").update(String(code)).digest("hex");

const findActiveSubscription = (email) =>
  Subscription.findOne({ subscriberEmail: email, status: "active" }).sort({ createdAt: -1 });

const isExpired = (sub) => sub?.expiresAt && sub.expiresAt < new Date();

const SUBSCRIBER_COOKIE = "subscriber_token";

const setSubscriberCookie = (res, payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie(SUBSCRIBER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const readSubscriberToken = (req) => {
  const token = req.cookies?.[SUBSCRIBER_COOKIE];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

const hasUsableStripeKey = () =>
  process.env.STRIPE_SECRET_KEY &&
  process.env.STRIPE_SECRET_KEY.startsWith("sk_") &&
  !process.env.STRIPE_SECRET_KEY.includes("replace");

const plans = {
  images: { amount: 5, currency: "USD", name: "Premium Images Access" },
  videos: { amount: 10, currency: "USD", name: "Premium Videos Access" },
};

export const createSubscriptionCheckoutSession = asyncHandler(
  async (req, res) => {
    const { plan, subscriberName, subscriberEmail } = req.body;

    if (!["images", "videos"].includes(plan)) {
      return res.status(400).json({ error: "Invalid subscription plan" });
    }

    const selectedPlan = plans[plan];

    const subscription = await Subscription.create({
      subscriberName,
      subscriberEmail,
      plan,
      amount: selectedPlan.amount,
      currency: selectedPlan.currency,
      status: "pending",
      provider: "stripe",
    });

    if (!hasUsableStripeKey()) {
      return res.status(200).json({
        success: true,
        message: "Stripe is not configured yet. Subscription record created as pending.",
        subscription,
      });
    }

    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: subscriberEmail || undefined,
        line_items: [
          {
            price_data: {
              currency: selectedPlan.currency.toLowerCase(),
              product_data: {
                name: selectedPlan.name,
                description:
                  plan === "images"
                    ? "$5 premium images access"
                    : "$10 premium videos and links access",
              },
              unit_amount: selectedPlan.amount * 100,
            },
            quantity: 1,
          },
        ],
        metadata: {
          subscriptionId: subscription._id.toString(),
          plan,
        },
        success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/subscribe/cancel`,
      });

      subscription.stripeSessionId = session.id;
      await subscription.save();

      return res.json({ success: true, sessionId: session.id, url: session.url });
    } catch {
      return res.status(200).json({
        success: true,
        message: "Stripe checkout is not available. Subscription record created as pending.",
        subscription,
      });
    }
  }
);

export const getMySubscription = asyncHandler(async (req, res) => {
  const email = req.query.email?.toLowerCase()?.trim();

  if (!email) {
    return res.json({
      success: true,
      subscribed: false,
      plan: null,
      message: "No email provided.",
    });
  }

  const subscription = await Subscription.findOne({
    subscriberEmail: email,
    status: "active",
  }).sort({ createdAt: -1 });

  if (
    !subscription ||
    (subscription.expiresAt && subscription.expiresAt < new Date())
  ) {
    return res.json({
      success: true,
      subscribed: false,
      plan: null,
      message: "No active subscription found.",
    });
  }

  res.json({
    success: true,
    subscribed: true,
    plan: subscription.plan,
    expiresAt: subscription.expiresAt,
    subscriberName: subscription.subscriberName,
  });
});

/*
  Request a one-time code. Only emails with an ACTIVE subscription
  receive a code. Rate-limited + captcha-guarded at the route level.
*/
export const requestSubscriberOtp = asyncHandler(async (req, res) => {
  const email = req.body.email?.toLowerCase()?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "A valid email address is required." });
  }

  const subscription = await findActiveSubscription(email);
  if (!subscription || isExpired(subscription)) {
    return res.status(403).json({
      error: "No active subscription found for this email. Please subscribe first.",
    });
  }

  /* Generate 6-digit code, store only its hash, 10-minute expiry */
  const code = String(crypto.randomInt(100000, 1000000));
  await SubscriberOtp.findOneAndUpdate(
    { email },
    { email, codeHash: hashCode(code), attempts: 0, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  try {
    await sendEmail({
      to: email,
      subject: "Your Bung Jack premium access code",
      text: `Your verification code is ${code}. It expires in 10 minutes.`,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:auto">
          <h2 style="color:#DC2626;margin-bottom:4px">Bung Jack Official</h2>
          <p>Use this code to unlock your premium content:</p>
          <p style="font-size:34px;font-weight:800;letter-spacing:8px;background:#f4f4f5;
                    padding:16px;border-radius:12px;text-align:center;margin:18px 0">${code}</p>
          <p style="color:#666;font-size:13px">This code expires in 10 minutes. If you didn't request it, ignore this email.</p>
        </div>`,
    });
  } catch (err) {
    /* If SMTP isn't configured, surface the code in dev so testing still works */
    if (process.env.NODE_ENV !== "production") {
      return res.json({ success: true, message: "Email not configured — dev code returned.", devCode: code });
    }
    return res.status(503).json({ error: "Could not send the verification email. Try again later." });
  }

  res.json({ success: true, message: "A verification code has been sent to your email." });
});

/*
  Verify the code. On success, issue a signed subscriber cookie that
  gates premium content (no more trusting a raw ?email= param).
*/
export const verifySubscriberOtp = asyncHandler(async (req, res) => {
  const email = req.body.email?.toLowerCase()?.trim();
  const code = String(req.body.code || "").trim();

  if (!email || !code) {
    return res.status(400).json({ error: "Email and code are required." });
  }

  const record = await SubscriberOtp.findOne({ email });
  if (!record || record.expiresAt < new Date()) {
    return res.status(400).json({ error: "Code expired or not found. Request a new one." });
  }

  if (record.attempts >= 5) {
    await SubscriberOtp.deleteOne({ _id: record._id });
    return res.status(429).json({ error: "Too many attempts. Request a new code." });
  }

  if (record.codeHash !== hashCode(code)) {
    record.attempts += 1;
    await record.save();
    return res.status(400).json({ error: "Incorrect code. Please try again." });
  }

  const subscription = await findActiveSubscription(email);
  if (!subscription || isExpired(subscription)) {
    return res.status(403).json({ error: "No active subscription found." });
  }

  await SubscriberOtp.deleteOne({ _id: record._id });
  setSubscriberCookie(res, { email, plan: subscription.plan });

  res.json({
    success: true,
    subscribed: true,
    plan: subscription.plan,
    subscriberName: subscription.subscriberName,
  });
});

/* Check whether the current browser holds a valid subscriber session */
export const getSubscriberSession = asyncHandler(async (req, res) => {
  const decoded = readSubscriberToken(req);
  if (!decoded?.email) {
    return res.json({ success: true, subscribed: false });
  }

  const subscription = await findActiveSubscription(decoded.email);
  if (!subscription || isExpired(subscription)) {
    return res.json({ success: true, subscribed: false });
  }

  res.json({
    success: true,
    subscribed: true,
    plan: subscription.plan,
    subscriberName: subscription.subscriberName,
  });
});

export const logoutSubscriber = asyncHandler(async (req, res) => {
  res.clearCookie(SUBSCRIBER_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ success: true });
});

/*
  Premium content — now gated by the verified subscriber cookie,
  NOT a raw email query param. This closes the email-guessing hole.
*/
export const getSubscriberContent = asyncHandler(async (req, res) => {
  const decoded = readSubscriberToken(req);
  if (!decoded?.email) {
    return res.status(401).json({ success: true, subscribed: false, items: [], message: "Verification required." });
  }

  const subscription = await findActiveSubscription(decoded.email);
  if (!subscription || isExpired(subscription)) {
    return res.json({ success: true, subscribed: false, plan: null, items: [], message: "No active subscription found." });
  }

  // $10 videos plan includes images too; $5 images plan gets images only
  const allowedPlans = subscription.plan === "videos" ? ["images", "videos"] : ["images"];

  const items = await PremiumContent.find({
    status: "published",
    accessPlan: { $in: allowedPlans },
  }).sort({ createdAt: -1 });

  res.json({ success: true, subscribed: true, plan: subscription.plan, items });
});

export const verifySubscription = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const subscription = await Subscription.findOne({
    stripeSessionId: sessionId,
  });

  if (!subscription) {
    return res.status(404).json({ error: "Subscription not found" });
  }

  if (!hasUsableStripeKey()) {
    subscription.status = "active";
    subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await subscription.save();
    return res.json({ success: true, subscription });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === "paid") {
    subscription.status = "active";
    subscription.stripeCustomerId = session.customer;
    subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await subscription.save();
  }

  res.json({ success: true, subscription });
});
