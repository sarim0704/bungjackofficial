import streamifier from 'streamifier';
import asyncHandler from '../utils/asyncHandler.js';
import cloudinary, { configureCloudinary } from '../config/cloudinary.js';

const uploadBuffer = (fileBuffer, folder) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });

export const uploadImage = asyncHandler(async (req, res) => {
  if (!configureCloudinary()) {
    return res.status(503).json({ error: 'Cloudinary is not configured.' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded.' });
  }

  const folder = req.body.folder || 'bungjackofficial';
  const result = await uploadBuffer(req.file.buffer, folder);

  res.status(201).json({
    url: result.secure_url,
    publicId: result.public_id,
  });
});
