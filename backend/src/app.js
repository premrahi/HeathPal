import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';

export const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/health', healthRouter);
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ message: status >= 500 ? 'Internal server error' : error.message });
});
