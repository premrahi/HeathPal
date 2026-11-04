import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User.js';
import { Session } from '../models/Session.js';
import { z, email, password, validate } from '../lib/validation.js';
import { ApiError } from '../lib/errors.js';
import { hashPassword, checkPassword, digest } from '../lib/crypto.js';
import { requireAuth } from '../middleware/auth.js';
import { createSession, clearSessionCookie, publicUser, cookieName } from '../services/sessions.js';
import { issueChallenge } from '../services/challenges.js';

export const authRouter = Router();
authRouter.use(rateLimit({ windowMs: 15 * 60000, limit: 60, standardHeaders: 'draft-8', legacyHeaders: false,
  message: { message: 'Too many account requests. Please try again later.' } }));
authRouter.post('/signup', validate(z.object({ name: z.string().trim().min(2).max(100), email, password })), async (req, res) => {
  const user = await User.create({ ...req.body, passwordHash: await hashPassword(req.body.password) });
  await issueChallenge(user, 'verify');
  res.status(201).json({ message: 'Account created. Check your email for a verification code.', email: user.email, verificationRequired: true });
});
authRouter.post('/login', validate(z.object({ email, password: z.string().min(1).max(128) })), async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+passwordHash');
  if (!user || !await checkPassword(req.body.password, user.passwordHash)) throw new ApiError(401, 'Email or password is incorrect.');
  if (!user.verifiedAt) return res.status(403).json({ message: 'Verify your email before signing in.', verificationRequired: true, email: user.email });
  await createSession(user, res);
  res.json({ user: publicUser(user) });
});
authRouter.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));
authRouter.post('/logout', async (req, res) => {
  const token = req.cookies?.[cookieName];
  if (typeof token === 'string') await Session.deleteOne({ tokenHash: digest(token) });
  clearSessionCookie(res);
  res.json({ message: 'Signed out.' });
});
