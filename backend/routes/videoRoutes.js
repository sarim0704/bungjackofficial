import express from 'express';
import {
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
} from '../controllers/videoController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { videoSchema } from '../schemas/schemas.js';

const router = express.Router();

router.get('/', getVideos);
router.get('/:id', getVideoById);
router.post('/', protect, validate(videoSchema), createVideo);
router.put('/:id', protect, validate(videoSchema), updateVideo);
router.delete('/:id', protect, deleteVideo);

export default router;
