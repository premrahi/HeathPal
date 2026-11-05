import { Router } from 'express';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { z, validate } from '../lib/validation.js';
import { publicUser } from '../services/sessions.js';

const text = max => z.string().trim().max(max).default('');
const profileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  profile: z.object({
    phone: text(30), gender: z.enum(['', 'Female', 'Male', 'Other', 'Prefer not to say']).default(''),
    dateOfBirth: z.string().default('').refine(value => !value || (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value && new Date(value) <= new Date()), 'Enter a valid date of birth.'),
    country: text(100), city: text(100),
    bloodGroup: z.enum(['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).default(''),
    allergies: text(1000), conditions: text(1000),
  }),
});
export const profileRouter = Router();
profileRouter.use(requireAuth);
profileRouter.get('/', (req, res) => res.json({ user: publicUser(req.user) }));
profileRouter.put('/', validate(profileSchema), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, { $set: req.body }, { new: true, runValidators: true });
  res.json({ user: publicUser(user), message: 'Profile updated.' });
});
