import rateLimit from "express-rate-limit";

/* 400 req / 15 min per IP for all /api routes.
   Higher than a typical SPA needs because the admin dashboard fans out
   ~8 requests per refresh; sensitive routes have their own tighter limits. */
export const globalRateLimiter = rateLimit({
  windowMs:           15 * 60 * 1000,
  max:                400,
  standardHeaders:    true,
  legacyHeaders:      false,
  message:            { error: "Too many requests. Please try again later." },
});

/* 8 attempts / 15 min — wrong passwords only */
export const authLimiter = rateLimit({
  windowMs:               15 * 60 * 1000,
  max:                    8,
  standardHeaders:        true,
  legacyHeaders:          false,
  skipSuccessfulRequests: true,
  message:                { error: "Too many login attempts. Try again in 15 minutes." },
});

/* 20 checkout attempts / hour per IP */
export const donationLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,
  max:             20,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { error: "Too many payment requests. Please try again later." },
});

/* 5 messages / hour per IP */
export const contactLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,
  max:             5,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { error: "You have sent too many messages. Please wait before submitting again." },
});

/* 10 subscription attempts / hour per IP */
export const subscriptionLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,
  max:             10,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { error: "Too many subscription requests. Please try again later." },
});

/* 6 OTP requests / 15 min per IP — prevents email-bombing & code brute-force */
export const otpLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             6,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { error: "Too many code requests. Please wait a few minutes and try again." },
});
