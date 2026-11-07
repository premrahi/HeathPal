import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { Report } from '../models/Report.js';
import { requireAuth } from '../middleware/auth.js';
import { reportUpload, checkUploadedFile } from '../middleware/upload.js';
import { ApiError } from '../lib/errors.js';
import { z, parse, pagination, idParam } from '../lib/validation.js';

export const reportsRouter = Router();
reportsRouter.use(requireAuth);
const metadata = z.object({
  title: z.string().trim().min(1).max(120),
  category: z.enum(['Laboratory', 'Imaging', 'Prescription', 'Other']).default('Other'),
  reportDate: z.string().default('').refine(value => !value || (/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value), 'Enter a valid report date.'),
});
reportsRouter.get('/', async (req, res) => {
  const { page, limit } = parse(pagination, req.query);
  const search = parse(z.string().trim().max(100).default(''), req.query.search);
  const query = { user: req.user._id };
  if (search) query.title = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  const [items, total] = await Promise.all([Report.find(query).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit), Report.countDocuments(query)]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});
reportsRouter.post('/', rateLimit({ windowMs: 60000, limit: 10, legacyHeaders: false, message: { message: 'Too many uploads. Wait a minute.' } }), reportUpload, async (req, res) => {
  checkUploadedFile(req.file);
  const data = parse(metadata, req.body);
  const report = await Report.create({ ...data, user: req.user._id, fileData: req.file.buffer,
    filename: req.file.originalname.replace(/[^a-zA-Z0-9._ -]/g, '_').slice(0, 150), mimeType: req.file.mimetype, size: req.file.size });
  res.status(201).json({ report, message: 'Report uploaded privately.' });
});
reportsRouter.get('/:id', idParam, async (req, res) => {
  const report = await Report.findOne({ _id: req.params.id, user: req.user._id });
  if (!report) throw new ApiError(404, 'Report not found.');
  res.json({ report });
});
reportsRouter.get('/:id/file', idParam, async (req, res) => {
  const report = await Report.findOne({ _id: req.params.id, user: req.user._id }).select('+fileData');
  if (!report) throw new ApiError(404, 'Report not found.');
  res.set('Cache-Control', 'no-store');
  res.attachment(report.filename || 'report').type(report.mimeType).send(report.fileData);
});
reportsRouter.delete('/:id', idParam, async (req, res) => {
  const result = await Report.deleteOne({ _id: req.params.id, user: req.user._id });
  if (!result.deletedCount) throw new ApiError(404, 'Report not found.');
  res.json({ message: 'Report and its file deleted.' });
});
