import { Session } from '../models/Session.js';
import { cookieName } from '../services/sessions.js';
import { digest } from '../lib/crypto.js';
import { ApiError } from '../lib/errors.js';
import mongoose from 'mongoose';

export async function requireAuth(req, _res, next) {
  const token = req.cookies?.[cookieName];
  if (!token || typeof token !== 'string' || token.length !== 64) throw new ApiError(401, 'Please sign in to continue.');
  if (mongoose.connection.readyState !== 1) throw new ApiError(503, 'The database is temporarily unavailable.');
  const session = await Session.findOne({ tokenHash: digest(token), expiresAt: { $gt: new Date() } }).populate('user');
  if (!session?.user?.verifiedAt) throw new ApiError(401, 'Your session has expired. Please sign in again.');
  req.user = session.user;
  req.session = session;
  next();
}
