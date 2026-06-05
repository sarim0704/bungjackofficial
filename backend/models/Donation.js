import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    donorName: { type: String, trim: true, maxlength: 100, default: '' },
    donorEmail: { type: String, lowercase: true, trim: true, default: '' },
    currency: { type: String, required: true, enum: ['USD', 'CAD', 'THB'] },
    amount: { type: Number, required: true, min: 1 },
    amountInCents: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'cancelled'], default: 'pending' },
    provider: { type: String, default: 'stripe' },
    stripeSessionId: { type: String, index: true, default: '' },
    stripePaymentId: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
  },
  { timestamps: true }
);

donationSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  if (obj.donorEmail) {
    const [user, domain] = obj.donorEmail.split('@');
    obj.donorEmail = `${user.slice(0, 2)}***@${domain}`;
  }
  return obj;
};

export default mongoose.model('Donation', donationSchema);
