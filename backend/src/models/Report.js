import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true }, category: { type: String, default: 'Other' },
  reportDate: { type: String, default: '' }, filename: String, mimeType: String, size: Number,
  fileData: { type: Buffer, required: true, select: false },
  status: { type: String, enum: ['uploaded', 'analyzing', 'ready', 'failed', 'not_medical'], default: 'uploaded' },
  analysis: { summary: String, english: String, romanUrdu: String, questions: [String] },
  analysisError: { type: String, default: '' }, analyzedAt: Date,
}, { timestamps: true });
schema.index({ user: 1, createdAt: -1 });
schema.set('toJSON', { transform(_doc, value) { delete value.fileData; delete value.__v; return value; } });
export const Report = mongoose.model('Report', schema);
