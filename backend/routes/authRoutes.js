import express from "express";

import {
  login,
  logout,
  me,
  setup2FA,
  enable2FA,
  disable2FA,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";
import { loginSchema } from "../schemas/schemas.js";
import { captchaGuard } from "../utils/verifyCaptcha.js";

const router = express.Router();

router.post("/login", authLimiter, captchaGuard, validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", protect, me);

/* ── Two-factor authentication management ── */
router.post("/2fa/setup", protect, setup2FA);
router.post("/2fa/enable", protect, enable2FA);
router.post("/2fa/disable", protect, disable2FA);

export default router;
