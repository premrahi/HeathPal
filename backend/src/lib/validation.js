import { z } from 'zod';
import { ApiError } from './errors.js';

export { z };
export const email = z.string().trim().toLowerCase().email().max(254);
export const password = z.string().min(10, 'Use at least 10 characters.').max(128);
export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid record ID.');
export function parse(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new ApiError(
      400,
      result.error.issues[0].message,
      result.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
    );
  return result.data;
}
export const validate = (schema) => (req, _res, next) => {
  req.body = parse(schema, req.body);
  next();
};
export const idParam = (req, _res, next) => {
  parse(objectId, req.params.id);
  next();
};
export const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});
