import { Router } from 'express';
import mongoose from 'mongoose';
import { config } from '../config/env.js';

export const healthRouter = Router();
healthRouter.get('/', (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'unavailable',
    service: 'HealthPal API',
    database: connected ? 'connected' : 'disconnected',
    aiEnabled: Boolean(config.geminiKey),
    developmentMail: !config.production && config.mailMode === 'console',
  });
});
