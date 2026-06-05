import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { pathToFileURL } from "url";

import { connectDB } from "./config/db.js";

import postRoutes          from "./routes/postRoutes.js";
import videoRoutes         from "./routes/videoRoutes.js";
import settingRoutes       from "./routes/settingRoutes.js";
import contactRoutes       from "./routes/contactRoutes.js";
import donationRoutes      from "./routes/donationRoutes.js";
import authRoutes          from "./routes/authRoutes.js";
import adminRoutes         from "./routes/adminRoutes.js";
import uploadRoutes        from "./routes/uploadRoutes.js";
import subscriptionRoutes  from "./routes/subscriptionRoutes.js";
import premiumContentRoutes from "./routes/premiumContentRoutes.js";

import { globalRateLimiter } from "./middleware/rateLimiter.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

/* Behind Render/Vercel/Heroku-style reverse proxies, trust the first hop
   so req.ip + express-rate-limit see the REAL client IP (not the proxy's),
   and secure cookies work. '1' = one proxy hop (not 'true', which would let
   clients spoof X-Forwarded-For to bypass rate limits). */
app.set("trust proxy", 1);

export const dbReady = connectDB();

/* ── Security headers (Helmet) ────────────────────────── */
const FRONTEND_URL = process.env.FRONTEND_URL || "";

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:    ["'self'"],
        connectSrc:    [
          "'self'",
          "https://api.stripe.com",
          "https://checkout.stripe.com",
          FRONTEND_URL,
          "http://localhost:5173",
          "http://127.0.0.1:5173",
        ].filter(Boolean),
        frameSrc:      ["'self'", "https://js.stripe.com", "https://checkout.stripe.com"],
        scriptSrc:     ["'self'", "https://js.stripe.com"],
        styleSrc:      ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc:       ["'self'", "https://fonts.gstatic.com"],
        imgSrc:        [
          "'self'", "data:",
          "https://res.cloudinary.com",
          "https://images.unsplash.com",
          "https://*.fbcdn.net",
          "https://*.cdninstagram.com",
        ],
        objectSrc:     ["'none'"],
        baseUri:       ["'self'"],
        formAction:    ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy:  false,
    crossOriginOpenerPolicy:    { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy:  { policy: "same-site" },
    referrerPolicy:             { policy: "strict-origin-when-cross-origin" },
    hsts: {
      maxAge:            31536000,
      includeSubDomains: true,
      preload:           true,
    },
    frameguard:         { action: "sameorigin" },
    noSniff:            true,
    xssFilter:          true,
    hidePoweredBy:      true,
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
  })
);

/* ── Additional security headers ──────────────────────── */
app.use((req, res, next) => {
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

/* ── CORS ─────────────────────────────────────────────── */
/* Normalise: strip trailing slashes so a FRONTEND_URL like
   "https://site.app/" still matches the Origin "https://site.app". */
const norm = (u) => (u || "").replace(/\/+$/, "");

/* Comma-separated FRONTEND_URL is supported (e.g. prod + custom domain) */
const envOrigins = (FRONTEND_URL || "")
  .split(",")
  .map((s) => norm(s.trim()))
  .filter(Boolean);

const allowedOrigins = [
  ...envOrigins,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://bungjackofficial.com",
  "https://www.bungjackofficial.com",
];

/* Allow this project's Vercel deployment + preview URLs.
   Scoped to the owner's Vercel account namespace, so third parties
   can't spoof an allowed origin. Override via VERCEL_ORIGIN_REGEX env. */
const vercelOriginRegex = process.env.VERCEL_ORIGIN_REGEX
  ? new RegExp(process.env.VERCEL_ORIGIN_REGEX)
  : /^https:\/\/[a-z0-9-]+-sarim0704s-projects\.vercel\.app$/i;

const isAllowedOrigin = (origin) => {
  const o = norm(origin);
  if (allowedOrigins.includes(o)) return true;
  if (vercelOriginRegex.test(o)) return true;
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      /* Allow Postman / server-to-server requests without an Origin header */
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        /* Disallowed origin — deny without throwing (avoids a 500) */
        callback(null, false);
      }
    },
    credentials: true,
    methods:     ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ── Stripe webhook — raw body before json() ──────────── */
app.use("/api/donations/webhook", express.raw({ type: "application/json" }));

/* ── Body parsing (strict 10 KB limit) ────────────────── */
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

/* ── Data sanitisation ────────────────────────────────── */
app.use(mongoSanitize({ replaceWith: "_" }));
app.use(xss());
app.use(hpp());

/* ── Global rate limiter ──────────────────────────────── */
app.use("/api", globalRateLimiter);

/* ── Health check ─────────────────────────────────────── */
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "BungJack backend is running." });
});

/* ── API routes ───────────────────────────────────────── */
app.use("/api/auth",            authRoutes);
app.use("/api/posts",           postRoutes);
app.use("/api/videos",          videoRoutes);
app.use("/api/settings",        settingRoutes);
app.use("/api/contact",         contactRoutes);
app.use("/api/donations",       donationRoutes);
app.use("/api/subscriptions",   subscriptionRoutes);
app.use("/api/premium-content", premiumContentRoutes);
app.use("/api/admin",           adminRoutes);
app.use("/api/uploads",         uploadRoutes);

/* ── 404 + error handler ──────────────────────────────── */
app.use(notFound);
app.use(errorHandler);

/* ── Start server ─────────────────────────────────────── */
const PORT = parseInt(process.env.PORT, 10) || 5000;

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  await dbReady;
  app.listen(PORT, () => {
    console.log(`[server] Running on port ${PORT} — ${process.env.NODE_ENV || "development"}`);
  });
}

export default app;
