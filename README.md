# BungJack Official – Complete Full-Stack Project

This build includes the approved public frontend design plus a secure Node/Express/MongoDB backend.

## Apps

```text
frontend/  React + Vite + Router + Tailwind + Framer Motion
backend/   Express + MongoDB + JWT httpOnly auth + Stripe + Cloudinary + Nodemailer
```

## Frontend routes

```text
/                     Home
/about                About
/news                 Public posts listing
/videos               Public videos listing
/reels                Public reels listing
/investigations       Investigations listing
/donate               Donation checkout UI
/donate/success       Donation success screen
/donate/cancel        Donation cancelled screen
/subscribe            $5 images / $10 videos subscription checkout
/subscribe/success    Premium library after subscription verification
/subscribe/cancel     Subscription cancel fallback
/premium              Subscriber-only premium content library
/contact              Contact page
/admin                Protected admin dashboard
```

## Backend routes

```text
/api/health
/api/auth/login
/api/auth/logout
/api/auth/me
/api/admin/dashboard
/api/posts
/api/videos
/api/settings
/api/contact
/api/donations
/api/subscriptions
/api/premium-content
/api/uploads/image
```

## Security features

- Helmet with CSP
- CORS allowlist
- Rate limiting
- JWT stored in httpOnly cookie
- bcrypt admin password hashing
- Zod validation
- Mongo sanitization
- XSS sanitization
- HTTP parameter pollution protection
- Stripe webhook raw body handler
- Centralized error handling
- No card data stored on server

## Subscription model

- `$5` plan: images access
- `$10` plan: videos + links + images access
- Admin uploads premium content from `/admin` under Premium tab
- Subscriber-only library is available at `/premium`
- Stripe checkout endpoint: `POST /api/subscriptions/create-checkout-session`

## Run locally

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Seed admin after setting `.env`:

```bash
npm run seed:admin
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Required production environment variables

See `backend/.env.example` and `frontend/.env.example`.

## Deployment plan

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Domain: Hostinger DNS → Vercel Edge CDN
