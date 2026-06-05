# Codex Brief — Make Bung Jack Ready & Deploy (Vercel + Render)

You are deploying a **monorepo** with two apps. Follow every step in order. Do **not** skip the pre-flight or the project-specific gotchas.

```
bungjack_complete_project/
├── backend/     → Express + MongoDB API   → deploy to RENDER
├── frontend/    → Vite + React SPA         → deploy to VERCEL
├── .gitignore   → already excludes .env, node_modules, dist
├── DEPLOY.md    → human deploy guide (reference)
└── CODEX_DEPLOY_BRIEF.md  → this file
```

- **Backend:** Node ≥20, ESM (`"type":"module"`). Start: `npm start` (`node server.js`). Port from `process.env.PORT`.
- **Frontend:** Vite. Build: `npm run build` → outputs `dist/`. SPA rewrites already in `frontend/vercel.json`.

---

## ⚠️ PROJECT-SPECIFIC GOTCHAS — do not violate these

1. **`otplib` MUST stay at `12.0.1`.** v13+ removed the `authenticator` API and the backend won't boot. Never run `npm update otplib` or bump it. If `package.json` shows anything other than `otplib@^12` / `12.0.1`, reinstall `npm install otplib@12.0.1`.
2. **Never commit `.env` files.** Both `backend/.env` and `frontend/.env` exist locally with REAL secrets. Confirm `git status` does NOT list them before any push. The root `.gitignore` already covers them — verify it's working.
3. **CSP hardcodes the backend URL.** In `frontend/index.html` the `<meta http-equiv="Content-Security-Policy">` `connect-src` directive lists the backend origin. After you know the Render URL, update `connect-src` to include it (replace/add `https://YOUR-BACKEND.onrender.com`). If you skip this, the deployed frontend cannot call the API.
4. **Production cookies are `SameSite=None; Secure`.** Both apps must be served over HTTPS (Render + Vercel are by default). The backend reads `FRONTEND_URL` for CORS — it MUST be set to the exact Vercel origin or auth/login/OTP cookies will be blocked.
5. **`connectDB()` calls `process.exit(1)` on failure.** MongoDB Atlas must allow Render's IP. Set Atlas Network Access to `0.0.0.0/0` (or Render egress IPs).
6. **Do not refactor app code.** This is a deploy task. Only touch: `.gitignore` (verify), `frontend/index.html` (CSP URL), and env/config. No feature changes.

---

## STEP 1 — Pre-flight validation (local)

Run and confirm all pass. Fix only blocking errors; do not "improve" code.

```bash
# Backend installs + 0 vulns + boots far enough to load all modules
cd backend && npm install && npm audit --omit=dev
node --check server.js
node -e "const {authenticator}=require('otplib'); const s=authenticator.generateSecret(); console.log('otplib ok:', authenticator.verify({token:authenticator.generate(s),secret:s}))"
# Expect: otplib ok: true   (if false/throws → reinstall otplib@12.0.1)

# Frontend builds clean
cd ../frontend && npm install && npm run build
# Expect: "built in …", dist/ produced, 0 errors
```

Verify secrets are ignored:
```bash
cd .. && git init 2>/dev/null; git add -A --dry-run | grep -E "\.env$" && echo "STOP: .env is tracked — fix .gitignore" || echo "OK: no .env tracked"
```

---

## STEP 2 — Push to GitHub

The repo is **not yet initialized**. Create it and push.

```bash
cd <project root>
git init
git add -A
# Final safety check — must print nothing:
git status --porcelain | grep -E "(^|/)\.env$"
git commit -m "Production-ready: Bung Jack Official media platform"
git branch -M main
```

Then create a GitHub repo and push. If the GitHub CLI is available:
```bash
gh repo create bungjack-official --private --source=. --remote=origin --push
```
Otherwise instruct the user to create an empty repo, then:
```bash
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

---

## STEP 3 — Provision MongoDB Atlas (if not done)

- Create a free cluster + DB user (strong password).
- Network Access → allow `0.0.0.0/0`.
- Copy the SRV connection string → this is `MONGO_URI`.

---

## STEP 4 — Deploy BACKEND to Render

Create a **Web Service** (dashboard or `render.yaml`). Settings:

- **Root Directory:** `backend`
- **Runtime:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Node version:** 20 (set env `NODE_VERSION=20` if needed)
- **Health check path:** `/api/health`

### Backend environment variables (set ALL of these in Render)

```
NODE_ENV=production
PORT=5000
MONGO_URI=<atlas srv string>
FRONTEND_URL=<the Vercel URL from Step 5 — fill after frontend deploy>
JWT_SECRET=<64-char hex>          # generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_EXPIRE=7d
ADMIN_NAME=Bung Jack Admin
ADMIN_EMAIL=admin@bungjackofficial.com
ADMIN_PASSWORD=<strong unique password>
CLOUDINARY_CLOUD_NAME=<...>
CLOUDINARY_API_KEY=<...>
CLOUDINARY_API_SECRET=<...>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<smtp user>
SMTP_PASS=<smtp app password>
ADMIN_NOTIFY_EMAIL=blackservice27@gmail.com
# Optional now (leave as replace_me to keep disabled):
TURNSTILE_SECRET_KEY=replace_me
STRIPE_SECRET_KEY=sk_test_replace_me
STRIPE_WEBHOOK_SECRET=whsec_replace_me
```

After first successful deploy, **seed the admin** once (Render Shell):
```bash
npm run seed:admin
```

Note the backend URL, e.g. `https://bungjack-api.onrender.com`.

---

## STEP 5 — Deploy FRONTEND to Vercel

Import the same GitHub repo. Settings:

- **Root Directory:** `frontend`
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- (`frontend/vercel.json` already handles SPA routing — leave it.)

### Frontend environment variables (Vercel)

```
VITE_API_URL=https://<your-backend>.onrender.com/api
VITE_TURNSTILE_SITE_KEY=replace_me            # optional
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_replace_me # optional
```

Deploy. Note the Vercel URL, e.g. `https://bungjack.vercel.app`.

---

## STEP 6 — Wire the two together (critical)

1. **Render:** set `FRONTEND_URL` to the exact Vercel origin (no trailing slash) → redeploy backend.
2. **Vercel:** confirm `VITE_API_URL` = Render URL + `/api` → redeploy frontend.
3. **Edit `frontend/index.html` CSP** `connect-src` to include the real backend origin, commit, push (triggers Vercel redeploy):
   ```
   connect-src 'self' https://api.stripe.com https://<your-backend>.onrender.com https://challenges.cloudflare.com;
   ```
   Remove the old placeholder backend host if present. Keep `https://challenges.cloudflare.com` (Turnstile) and Stripe.

---

## STEP 7 — Post-deploy verification

```bash
curl https://<backend>.onrender.com/api/health
# → {"success":true,"message":"BungJack backend is running."}

curl -o /dev/null -w "%{http_code}\n" https://<backend>.onrender.com/api/premium-content
# → 401  (premium content must be protected)

curl -o /dev/null -w "%{http_code}\n" https://<backend>.onrender.com/api/posts
# → 200
```

Manual browser checks on the Vercel URL:
- [ ] Site loads, dark/light toggle works, logo shows (user must have placed `frontend/public/logo.webp`)
- [ ] `/admin` → log in with seeded creds → dashboard loads (CORS cookie works)
- [ ] Create a post with an image upload (Cloudinary) → appears on `/content`
- [ ] Submit `/contact` form → success (and email arrives if SMTP set)
- [ ] No CSP errors in browser console (if API calls are blocked → fix Step 6.3)

---

## STEP 8 — Hand-off notes for the user (report these)

- Enable **Admin 2FA**: Settings → Two-factor authentication (scan QR).
- To turn on **CAPTCHA**: get free Cloudflare Turnstile keys → set `TURNSTILE_SECRET_KEY` (Render) + `VITE_TURNSTILE_SITE_KEY` (Vercel) → redeploy.
- To enable **Stripe** later: set `STRIPE_SECRET_KEY` + `VITE_STRIPE_PUBLISHABLE_KEY`, add webhook → `…/api/donations/webhook`, set `STRIPE_WEBHOOK_SECRET`.
- Place the brand logo at `frontend/public/logo.webp` (transparent background recommended).

**Do not** commit any real secret values into the repo, into `.env.example`, or into `index.html`. Secrets live only in Render/Vercel dashboards.
```
