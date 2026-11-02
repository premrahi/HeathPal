export class ApiError extends Error {
  constructor(status, message, details) { super(message); this.status = status; this.details = details; }
}

export function notFound(_req, res) { res.status(404).json({ message: 'Route not found' }); }

export function errorHandler(error, _req, res, _next) {
  if (error.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' });
  if (error.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ message: 'Choose a file smaller than 10 MB.' });
  if (error.name === 'MulterError') return res.status(400).json({ message: 'Upload one PDF, PNG, JPEG, or WebP file.' });
  const status = error.status || (error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500);
  if (status >= 500) console.error('Request failed:', error.name);
  res.status(status).json({ message: status >= 500 && !(error instanceof ApiError) ? 'Something went wrong. Please try again.' : error.message,
    ...(error.details ? { details: error.details } : {}) });
}
