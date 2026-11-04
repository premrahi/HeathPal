import { Challenge } from '../models/Challenge.js';
import { randomCode, hashPassword, checkPassword } from '../lib/crypto.js';
import { ApiError } from '../lib/errors.js';
import { sendCode } from './mail.js';

export async function issueChallenge(user, purpose) {
  const recent = await Challenge.exists({ user: user._id, purpose, updatedAt: { $gt: new Date(Date.now() - 60000) } });
  if (recent) throw new ApiError(429, 'Please wait one minute before requesting another code.');
  const code = randomCode();
  const challenge = await Challenge.findOneAndUpdate({ user: user._id, purpose }, {
    codeHash: await hashPassword(code), attempts: 0, expiresAt: new Date(Date.now() + 600000),
  }, { upsert: true, new: true });
  try { await sendCode(user.email, code, purpose); }
  catch (error) { await Challenge.deleteOne({ _id: challenge._id, updatedAt: challenge.updatedAt }); throw error; }
}
export async function consumeChallenge(user, purpose, code) {
  const challenge = await Challenge.findOneAndUpdate({ user: user._id, purpose,
    expiresAt: { $gt: new Date() }, attempts: { $lt: 5 } }, { $inc: { attempts: 1 } }, { new: true }).select('+codeHash');
  if (!challenge || !await checkPassword(code, challenge.codeHash)) throw new ApiError(400, 'Invalid or expired code. Request a new code if needed.');
  const consumed = await Challenge.deleteOne({ _id: challenge._id, codeHash: challenge.codeHash, expiresAt: { $gt: new Date() } });
  if (!consumed.deletedCount) throw new ApiError(400, 'This code has already been used.');
}
