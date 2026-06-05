import express from 'express';
import {
  createCheckoutSession,
  handleWebhook,
  verifyDonation,
  getDonations,
} from '../controllers/donationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { donationLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { donationSchema } from '../schemas/schemas.js';

const router = express.Router();

router.post('/create-checkout-session', donationLimiter, validate(donationSchema), createCheckoutSession);
router.post('/webhook', handleWebhook);
router.get('/verify/:sessionId', verifyDonation);
router.get('/', protect, getDonations);

export default router;
