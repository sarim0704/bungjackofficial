# Bung Jack Official — Deployment Guide

Backend → **Render** · Frontend → **Vercel** · Database → **MongoDB Atlas** · Media → **Cloudinary**

---

## 0. Before you start — checklist

- [ ] MongoDB Atlas cluster created
- [ ] Cloudinary account (for image uploads)
- [ ] An SMTP sender (Gmail App Password works) — needed for **contact alerts + subscriber OTP emails**
- [ ] (Optional) Cloudflare Turnstile keys (free CAPTCHA)
- [ ] (Optional) Stripe keys — *leave for later; the app runs without them*
- [ ] `logo.webp` saved at `frontend/public/logo.webp`

> ⚠️ Never commit `.env` files. The root `.gitignore` already excludes them.

---

## 1. MongoDB Atlas

1. Create a free cluster.
2. **Database Access** → add a user with a strong password.
3. **Network Access** → add IP `0.0.0.0/0` (allow from anywhere) so Render can connect — or add Render's egress IPs.
4. Copy the connection string → this is `MONGO_URI`.

---

## 2. Backend — Render

**Create a new Web Service** pointing at the `backend/` folder.

- **Build command:** `npm install`
- **Start command:** `npm start`
- **Node version:** 20+

### Environment variables (Render → Environment)

```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/bungjackofficial?retryWrites=true&w=majority
FRONTEND_URL=https://your-frontend-domain.com

# Auth — generate a real 64-char secret:  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=PASTE_64_CHAR_HEX_HERE
JWT_EXPIRE=7d

# First admin (used by the seed script)
ADMIN_NAME=Bung Jack Admin
ADMIN_EMAIL=admin@bungjackofficial.com
ADMIN_PASSWORD=USE_A_STRONG_UNIQUE_PASSWORD

# Cloudinary (image uploads + about-page images)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email (contact alerts + subscriber OTP codes)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_gmail_app_password
ADMIN_NOTIFY_EMAIL=blackservice27@gmail.com

# CAPTCHA (optional — leave as 'replace_me' to keep CAPTCHA off)
TURNSTILE_SECRET_KEY=replace_me

# Stripe (optional — payments stay disabled until set)
STRIPE_SECRET_KEY=sk_test_replace_me
STRIPE_WEBHOOK_SECRET=whsec_replace_me
```

### Seed the first admin (run once)

In Render's **Shell** tab (or locally with prod env):

```
npm run seed:admin
```

This creates/updates the superadmin from `ADMIN_*` vars. Log in, then **enable 2FA** (Settings → Two-factor authentication).

---

## 3. Frontend — Vercel

**Import the repo**, set the **root directory** to `frontend/`.

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`

### Environment variables (Vercel → Settings → Environment Variables)

```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_TURNSTILE_SITE_KEY=replace_me          # optional (pair with backend secret)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_replace_me   # optional
```

`frontend/vercel.json` already handles SPA routing (all routes → index.html).

---

## 4. Wire the two together

1. Set Render `FRONTEND_URL` to the Vercel URL (enables CORS + cookies).
2. Set Vercel `VITE_API_URL` to the Render URL + `/api`.
3. In `frontend/index.html`, the CSP `connect-src` must include your backend URL. Update this line if your backend host differs from `bungjackbackend.onrender.com`:
   ```
   connect-src 'self' https://api.stripe.com https://YOUR-BACKEND.onrender.com https://challenges.cloudflare.com;
   ```
4. Redeploy both.

> **Cookies note:** in production the auth + subscriber cookies use `SameSite=None; Secure`, so both sites **must be HTTPS** (Render + Vercel both are by default).

---

## 5. (Optional) Cloudflare Turnstile CAPTCHA

1. https://dash.cloudflare.com → **Turnstile** → add a site → choose your domain.
2. Copy the **Site Key** → Vercel `VITE_TURNSTILE_SITE_KEY`.
3. Copy the **Secret Key** → Render `TURNSTILE_SECRET_KEY`.
4. Redeploy. The widget now appears on Contact, Subscribe, Login, and the Premium OTP form.

If left as `replace_me`, CAPTCHA stays off and forms work normally.

---

## 6. Post-deploy security checklist

- [ ] `JWT_SECRET` is a real 64-char random value (not the placeholder)
- [ ] `ADMIN_PASSWORD` is strong and unique
- [ ] **2FA enabled** on the admin account
- [ ] `NODE_ENV=production` on the backend (enables secure cookies + hides error stacks)
- [ ] `.env` files are NOT in the repo (`git status` shows none)
- [ ] Atlas network access locked to what you need
- [ ] Test: admin login, create a post (with image upload), submit contact form, subscribe → verify OTP → premium unlock
- [ ] `npm audit` is clean in `backend/`

---

## 7. Quick smoke test (after deploy)

```
curl https://YOUR-BACKEND.onrender.com/api/health
# → {"success":true,"message":"BungJack backend is running."}

curl -o /dev/null -w "%{http_code}\n" https://YOUR-BACKEND.onrender.com/api/premium-content
# → 401  (premium content is protected)
```

---

## 8. Stripe (when you're ready)

1. Get live keys from the Stripe dashboard.
2. Set `STRIPE_SECRET_KEY` (Render) + `VITE_STRIPE_PUBLISHABLE_KEY` (Vercel).
3. Add a webhook endpoint → `https://YOUR-BACKEND.onrender.com/api/donations/webhook`, copy its signing secret → `STRIPE_WEBHOOK_SECRET`.
4. Redeploy. Donations + subscriptions go live automatically.
