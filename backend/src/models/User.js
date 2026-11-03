import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  verifiedAt: { type: Date, default: null },
  profile: {
    phone: { type: String, default: '' }, gender: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' }, country: { type: String, default: '' },
    city: { type: String, default: '' }, bloodGroup: { type: String, default: '' },
    allergies: { type: String, default: '' }, conditions: { type: String, default: '' },
  },
}, { timestamps: true });

userSchema.set('toJSON', { transform(_doc, value) { delete value.passwordHash; delete value.__v; return value; } });
export const User = mongoose.model('User', userSchema);
