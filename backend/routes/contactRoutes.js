import express from 'express';
import {
  createContactMessage,
  getContactMessages,
  markContactMessageRead,
  deleteContactMessage,
} from '../controllers/contactController.js';
import { protect } from '../middleware/authMiddleware.js';
import { contactLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { contactSchema } from '../schemas/schemas.js';
import { captchaGuard } from '../utils/verifyCaptcha.js';

const router = express.Router();

router.post('/', contactLimiter, captchaGuard, validate(contactSchema), createContactMessage);
router.get('/', protect, getContactMessages);
router.patch('/:id/read', protect, markContactMessageRead);
router.delete('/:id', protect, deleteContactMessage);

export default router;
