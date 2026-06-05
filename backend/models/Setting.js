import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    brandName: { type: String, default: 'Bung Jack Official', trim: true },
    tagline: { type: String, default: 'Independent Media Platform', trim: true },
    email: { type: String, default: 'blackservice27@gmail.com', trim: true, lowercase: true },
    whatsappLink: { type: String, default: 'https://wa.me/13124590936' },
    facebook: { type: String, default: 'https://www.facebook.com/share/1BSGbLnQcv/?mibextid=wwXIfr' },
    instagram: { type: String, default: 'https://www.instagram.com/rajputh62?igsh=Zno3NnhndGM4bjcy' },
    youtube: { type: String, default: '' },
    logo: { type: String, default: '' },
    logoPublicId: { type: String, default: '' },
    /* About page imagery — editable from admin */
    aboutHeroImage: { type: String, default: '' },
    aboutPortraitImage: { type: String, default: '' },
    aboutFeaturedImage: { type: String, default: '' },
    donationCurrencies: { type: [String], enum: ['USD', 'CAD', 'THB'], default: ['USD', 'CAD', 'THB'] },
  },
  { timestamps: true }
);

export default mongoose.model('Setting', settingSchema);
