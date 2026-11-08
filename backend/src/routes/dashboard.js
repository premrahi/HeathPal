import { Router } from 'express';
import { Report } from '../models/Report.js';
import { Vital } from '../models/Vital.js';
import { requireAuth } from '../middleware/auth.js';
import { parse, pagination } from '../lib/validation.js';

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);
dashboardRouter.get('/', async (req, res) => {
  const owner = { user: req.user._id };
  const [reportCount, vitalCount, analyzedCount, recentReports, latestVital, trend] = await Promise.all([
    Report.countDocuments(owner), Vital.countDocuments(owner), Report.countDocuments({ ...owner, status: 'ready' }),
    Report.find(owner).sort({ createdAt: -1 }).limit(4),
    Vital.findOne(owner).sort({ measuredAt: -1 }),
    Vital.find(owner).sort({ measuredAt: -1 }).limit(20),
  ]);
  res.json({ reportCount, vitalCount, analyzedCount, recentReports, latestVital, trend: trend.reverse() });
});
dashboardRouter.get('/insights', async (req, res) => {
  const { page, limit } = parse(pagination, req.query);
  const query = { user: req.user._id, status: 'ready' };
  const [items, total] = await Promise.all([Report.find(query).sort({ analyzedAt: -1 }).skip((page - 1) * limit).limit(limit), Report.countDocuments(query)]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});
