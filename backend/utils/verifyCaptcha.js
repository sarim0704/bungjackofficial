/*
  Cloudflare Turnstile verification.
  Free, privacy-friendly CAPTCHA. Get keys at:
  https://dash.cloudflare.com/?to=/:account/turnstile

  Set TURNSTILE_SECRET_KEY in the backend .env and
  VITE_TURNSTILE_SITE_KEY in the frontend .env.

  If no secret key is configured, verification is SKIPPED
  (returns true) so the site keeps working before keys are added.
*/
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const isCaptchaConfigured = () =>
  Boolean(process.env.TURNSTILE_SECRET_KEY &&
    !process.env.TURNSTILE_SECRET_KEY.includes("replace"));

export const verifyCaptcha = async (token, remoteIp) => {
  /* Not configured → skip (graceful degradation) */
  if (!isCaptchaConfigured()) return true;

  if (!token) return false;

  try {
    const body = new URLSearchParams();
    body.append("secret", process.env.TURNSTILE_SECRET_KEY);
    body.append("response", token);
    if (remoteIp) body.append("remoteip", remoteIp);

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    /* On network error, fail closed only if configured */
    return false;
  }
};

/*
  Express middleware — expects the token in req.body.captchaToken.
  Strips the token from the body afterwards so it doesn't reach
  Mongoose / validation schemas.
*/
export const captchaGuard = async (req, res, next) => {
  const token = req.body?.captchaToken;
  const ok = await verifyCaptcha(token, req.ip);

  if (!ok) {
    return res.status(400).json({ error: "Captcha verification failed. Please try again." });
  }

  if (req.body && "captchaToken" in req.body) delete req.body.captchaToken;
  next();
};
