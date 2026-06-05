import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { settingsSchema } from '../schemas/schemas.js';

const router = express.Router();

router.get('/', getSettings);
router.get('/admin', protect, getSettings);
router.put('/', protect, validate(settingsSchema), updateSettings);

export default router;
