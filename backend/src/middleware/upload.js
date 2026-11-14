import multer from 'multer';
import { ApiError } from '../lib/errors.js';

const allowed = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/webp']);
export const reportUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 4, fieldSize: 2000 },
  fileFilter(_req, file, done) {
    done(
      allowed.has(file.mimetype) ? null : new ApiError(400, 'Use PDF, PNG, JPEG, or WebP.'),
      allowed.has(file.mimetype),
    );
  },
}).single('file');

export function detectMime(buffer) {
  if (buffer.subarray(0, 5).toString() === '%PDF-') return 'application/pdf';
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
    return 'image/png';
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return 'image/jpeg';
  if (buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP')
    return 'image/webp';
  return null;
}
export function checkUploadedFile(file) {
  if (!file?.buffer?.length) throw new ApiError(400, 'Choose a report file.');
  if (detectMime(file.buffer) !== file.mimetype)
    throw new ApiError(400, 'The file contents do not match its type.');
}
