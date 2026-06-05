import jwt from "jsonwebtoken";
import otplib from "otplib";
import qrcode from "qrcode";

import Admin from "../models/Admin.js";
import asyncHandler from "../utils/asyncHandler.js";

/* otplib is CommonJS — destructure from the default import for ESM compat */
const { authenticator } = otplib;

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

const createToken = (adminId, role) =>
  jwt.sign({ id: adminId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

const setTokenCookie = (res, token) => {
  res.cookie("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const publicAdmin = (admin) => ({
  id: admin._id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
  twoFactorEnabled: admin.twoFactorEnabled,
});

/* ── Login (password + lockout + optional 2FA) ─────────── */
export const login = asyncHandler(async (req, res) => {
  const { email, password, token: totpToken } = req.body;

  const admin = await Admin.findOne({ email }).select("+password +twoFactorSecret");

  /* Generic message — never reveal whether the email exists */
  if (!admin) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  /* Locked out? */
  if (admin.isLocked()) {
    const mins = Math.ceil((admin.lockUntil - Date.now()) / 60000);
    return res.status(429).json({
      error: `Account temporarily locked due to failed attempts. Try again in ${mins} minute(s).`,
    });
  }

  const isMatch = await admin.matchPassword(password);

  if (!isMatch) {
    admin.failedLoginAttempts = (admin.failedLoginAttempts || 0) + 1;
    if (admin.failedLoginAttempts >= MAX_ATTEMPTS) {
      admin.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
      admin.failedLoginAttempts = 0;
    }
    await admin.save();
    return res.status(401).json({ error: "Invalid email or password" });
  }

  /* Password OK → enforce 2FA if enabled */
  if (admin.twoFactorEnabled) {
    if (!totpToken) {
      /* Tell the frontend to collect the authenticator code */
      return res.status(200).json({ twoFactorRequired: true });
    }
    const valid = authenticator.verify({
      token: String(totpToken).replace(/\s/g, ""),
      secret: admin.twoFactorSecret,
    });
    if (!valid) {
      return res.status(401).json({ error: "Invalid authentication code." });
    }
  }

  /* Success — reset counters, issue cookie */
  admin.failedLoginAttempts = 0;
  admin.lockUntil = undefined;
  admin.lastLogin = new Date();
  await admin.save();

  setTokenCookie(res, createToken(admin._id, admin.role));

  res.json({ success: true, message: "Login successful", admin: publicAdmin(admin) });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("admin_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ success: true, message: "Logged out successfully" });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, admin: req.admin });
});

/* ── 2FA: generate a secret + QR (does NOT enable yet) ─── */
export const setup2FA = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id).select("+twoFactorSecret");

  const secret = authenticator.generateSecret();
  admin.twoFactorSecret = secret;        // stored, but stays disabled until verified
  admin.twoFactorEnabled = false;
  await admin.save();

  const otpauth = authenticator.keyuri(admin.email, "Bung Jack Admin", secret);
  const qrDataUrl = await qrcode.toDataURL(otpauth);

  res.json({ success: true, secret, otpauth, qr: qrDataUrl });
});

/* ── 2FA: confirm a code to turn it on ─────────────────── */
export const enable2FA = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const admin = await Admin.findById(req.admin._id).select("+twoFactorSecret");

  if (!admin.twoFactorSecret) {
    return res.status(400).json({ error: "Start 2FA setup first." });
  }
  const valid = authenticator.verify({
    token: String(token || "").replace(/\s/g, ""),
    secret: admin.twoFactorSecret,
  });
  if (!valid) {
    return res.status(400).json({ error: "Invalid code. Please try again." });
  }

  admin.twoFactorEnabled = true;
  await admin.save();
  res.json({ success: true, message: "Two-factor authentication enabled." });
});

/* ── 2FA: disable (requires a valid current code) ──────── */
export const disable2FA = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const admin = await Admin.findById(req.admin._id).select("+twoFactorSecret");

  if (!admin.twoFactorEnabled) {
    return res.status(400).json({ error: "2FA is not enabled." });
  }
  const valid = authenticator.verify({
    token: String(token || "").replace(/\s/g, ""),
    secret: admin.twoFactorSecret,
  });
  if (!valid) {
    return res.status(400).json({ error: "Invalid code." });
  }

  admin.twoFactorEnabled = false;
  admin.twoFactorSecret = undefined;
  await admin.save();
  res.json({ success: true, message: "Two-factor authentication disabled." });
});
