import Video from '../models/Video.js';
import asyncHandler from '../utils/asyncHandler.js';

const buildVideoQuery = (query) => {
  const filters = {};
  if (query.status && query.status !== 'all') filters.status = query.status;
  else filters.status = 'published';
  if (query.status === 'all') delete filters.status;
  if (query.category) filters.category = query.category;
  if (query.platform) filters.platform = query.platform;
  if (query.featured) filters.featured = query.featured === 'true';
  return filters;
};

export const getVideos = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
  const skip = (page - 1) * limit;

  const filters = buildVideoQuery(req.query);
  const [items, total] = await Promise.all([
    Video.find(filters).sort({ featured: -1, createdAt: -1 }).skip(skip).limit(limit),
    Video.countDocuments(filters),
  ]);

  res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
});

export const getVideoById = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ error: 'Video not found.' });

  video.views += 1;
  await video.save({ validateBeforeSave: false });

  res.json(video);
});

export const createVideo = asyncHandler(async (req, res) => {
  const video = await Video.create(req.body);
  res.status(201).json(video);
});

export const updateVideo = asyncHandler(async (req, res) => {
  const video = await Video.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!video) return res.status(404).json({ error: 'Video not found.' });
  res.json(video);
});

export const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findByIdAndDelete(req.params.id);
  if (!video) return res.status(404).json({ error: 'Video not found.' });
  res.json({ success: true });
});
