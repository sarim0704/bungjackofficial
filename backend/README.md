# BungJack Official Backend

Secure Express + MongoDB backend for BungJack Official.

## Features

- Express.js API
- MongoDB Atlas + Mongoose
- JWT auth using httpOnly cookies
- bcrypt password hashing
- Zod validation
- Helmet security headers
- CORS whitelist
- Rate limiting
- NoSQL injection sanitization
- XSS sanitization
- HTTP parameter pollution protection
- Stripe Checkout session endpoint
- Stripe webhook verification with raw body
- Cloudinary image upload endpoint
- Nodemailer contact notification support
- Admin dashboard stats API

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Update `.env`, then run:

```bash
npm run dev
```

Seed admin:

```bash
npm run seed:admin
```

## API Endpoints

### Public

```text
GET    /api/health
GET    /api/settings
GET    /api/posts
GET    /api/posts/:id
GET    /api/videos
GET    /api/videos/:id
POST   /api/contact
POST   /api/donations/create-checkout-session
POST   /api/donations/webhook
GET    /api/donations/verify/:sessionId
```

### Auth/Admin

```text
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
GET    /api/admin/dashboard
POST   /api/posts
PUT    /api/posts/:id
DELETE /api/posts/:id
POST   /api/videos
PUT    /api/videos/:id
DELETE /api/videos/:id
PUT    /api/settings
GET    /api/contact
PATCH  /api/contact/:id/read
DELETE /api/contact/:id
GET    /api/donations
POST   /api/uploads/image
```

## Frontend Fetch Notes

Use `credentials: 'include'` for admin/auth requests because JWT is stored in an httpOnly cookie.

```js
fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
  credentials: 'include',
});
```

For public routes, credentials are optional.

## Stripe

Add webhook in Stripe dashboard:

```text
https://your-render-url.onrender.com/api/donations/webhook
```

Events:

```text
checkout.session.completed
checkout.session.expired
```
