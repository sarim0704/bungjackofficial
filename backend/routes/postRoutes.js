import express from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { postSchema } from '../schemas/schemas.js';

const router = express.Router();

router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', protect, validate(postSchema), createPost);
router.put('/:id', protect, validate(postSchema), updatePost);
router.delete('/:id', protect, deletePost);

export default router;
