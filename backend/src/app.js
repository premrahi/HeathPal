import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config/env.js';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { profileRouter } from './routes/profile.js';
import { vitalsRouter } from './routes/vitals.js';
import { reportsRouter } from './routes/reports.js';
import { dashboardRouter } from './routes/dashboard.js';
import { notFound, errorHandler, ApiError } from './lib/errors.js';

export const app = express();
if (config.trustProxy) app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    allowedHeaders: ['Content-Type', 'X-HealthPal'],
  }),
);
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use(
  '/api',
  rateLimit({
    windowMs: 60000,
    limit: 180,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message: 'Too many requests. Please wait a minute.' },
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use('/api', (req, _res, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    if (req.get('X-HealthPal') !== '1')
      throw new ApiError(403, 'Missing request verification header.');
    if (req.get('Origin') && req.get('Origin') !== new URL(config.clientUrl).origin)
      throw new ApiError(403, 'Request origin is not allowed.');
  }
  next();
});
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/vitals', vitalsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api', notFound);
if (config.production) {
  const dist = fileURLToPath(new URL('../../frontend/dist/', import.meta.url));
  app.use(express.static(dist));
  app.get('/{*splat}', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}
app.use(notFound);
app.use(errorHandler);
