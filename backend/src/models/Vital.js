import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    systolic: Number,
    diastolic: Number,
    glucose: Number,
    weight: Number,
    pulse: Number,
    measuredAt: { type: Date, required: true },
    note: { type: String, default: '' },
  },
  { timestamps: true },
);
schema.index({ user: 1, measuredAt: -1 });
export const Vital = mongoose.model('Vital', schema);
