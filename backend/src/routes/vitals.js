import { Router } from 'express';
import { Vital } from '../models/Vital.js';
import { requireAuth } from '../middleware/auth.js';
import { z, validate, idParam, parse, pagination } from '../lib/validation.js';
import { ApiError } from '../lib/errors.js';

const optionalNumber = (min, max) => z.number().min(min).max(max).nullable().optional();
export const vitalSchema = z.object({
  systolic: optionalNumber(30, 300), diastolic: optionalNumber(20, 250),
  glucose: optionalNumber(10, 1000), weight: optionalNumber(1, 700), pulse: optionalNumber(10, 300),
  measuredAt: z.string().datetime().refine(value => Date.parse(value) <= Date.now() + 60000, 'Measurement cannot be in the future.'),
  note: z.string().trim().max(1000).default(''),
}).refine(value => ['systolic', 'glucose', 'weight', 'pulse'].some(key => value[key] != null), 'Enter at least one measurement.')
  .refine(value => (value.systolic == null) === (value.diastolic == null), 'Enter both blood pressure values.')
  .refine(value => value.systolic == null || value.systolic > value.diastolic, 'Systolic must be greater than diastolic.');

export const vitalsRouter = Router();
vitalsRouter.use(requireAuth);
vitalsRouter.get('/', async (req, res) => {
  const { page, limit } = parse(pagination, req.query);
  const query = { user: req.user._id };
  const [items, total] = await Promise.all([Vital.find(query).sort({ measuredAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit), Vital.countDocuments(query)]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});
vitalsRouter.post('/', validate(vitalSchema), async (req, res) => {
  const vital = await Vital.create({ ...req.body, user: req.user._id });
  res.status(201).json({ vital, message: 'Measurement saved.' });
});
vitalsRouter.put('/:id', idParam, validate(vitalSchema), async (req, res) => {
  const vital = await Vital.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { $set: req.body }, { new: true });
  if (!vital) throw new ApiError(404, 'Measurement not found.');
  res.json({ vital, message: 'Measurement updated.' });
});
vitalsRouter.delete('/:id', idParam, async (req, res) => {
  const result = await Vital.deleteOne({ _id: req.params.id, user: req.user._id });
  if (!result.deletedCount) throw new ApiError(404, 'Measurement not found.');
  res.json({ message: 'Measurement deleted.' });
});
