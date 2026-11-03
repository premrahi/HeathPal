import { Session } from '../models/Session.js';
import { config } from '../config/env.js';
import { digest, randomToken } from '../lib/crypto.js';

export const cookieName = 'healthpal_session';
const cookieOptions = { httpOnly: true, secure: config.production, sameSite: 'strict', path: '/' };
export async function createSession(user, res) {
  const token = randomToken();
  const maxAge = config.sessionDays * 86400000;
  await Session.create({ user: user._id, tokenHash: digest(token), expiresAt: new Date(Date.now() + maxAge) });
  res.cookie(cookieName, token, { ...cookieOptions, maxAge });
}
export function clearSessionCookie(res) { res.clearCookie(cookieName, cookieOptions); }
export function publicUser(user) {
  return { _id: user._id, name: user.name, email: user.email, verifiedAt: user.verifiedAt, profile: user.profile, createdAt: user.createdAt };
}
