import Post from '../models/Post.js';
import asyncHandler from '../utils/asyncHandler.js';

const buildPostQuery = (query) => {
  const filters = {};
  if (query.status && query.status !== 'all') filters.status = query.status;
  else filters.status = 'published';
  if (query.status === 'all') delete filters.status;
  if (query.category) filters.category = query.category;
  if (query.featured) filters.featured = query.featured === 'true';
  return filters;
};

export const getPosts = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
  const skip = (page - 1) * limit;

  const filters = buildPostQuery(req.query);
  const [items, total] = await Promise.all([
    Post.find(filters).sort({ featured: -1, createdAt: -1 }).skip(skip).limit(limit),
    Post.countDocuments(filters),
  ]);

  res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
});

export const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }] });
  if (!post) return res.status(404).json({ error: 'Post not found.' });

  post.views += 1;
  await post.save({ validateBeforeSave: false });

  res.json(post);
});

export const createPost = asyncHandler(async (req, res) => {
  const post = await Post.create(req.body);
  res.status(201).json(post);
});

export const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!post) return res.status(404).json({ error: 'Post not found.' });
  res.json(post);
});

export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });
  res.json({ success: true });
});
