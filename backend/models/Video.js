import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    category: { type: String, required: true, enum: ['Video', 'Reel', 'Investigation', 'Story'] },
    platform: { type: String, required: true, enum: ['YouTube', 'Facebook', 'Instagram', 'Other'] },
    url: { type: String, required: true, trim: true },
    thumbnail: { type: String, default: '' },
    thumbnailPublicId: { type: String, default: '' },
    description: { type: String, maxlength: 500, default: '' },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    views: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

videoSchema.index({ status: 1, category: 1, createdAt: -1 });
videoSchema.index({ platform: 1 });
videoSchema.index({ featured: 1 });

export default mongoose.model('Video', videoSchema);
