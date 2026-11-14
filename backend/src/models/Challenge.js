import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    purpose: { type: String, enum: ['verify', 'reset'], required: true },
    codeHash: { type: String, required: true, select: false },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { timestamps: true },
);
schema.index({ user: 1, purpose: 1 }, { unique: true });
export const Challenge = mongoose.model('Challenge', schema);
