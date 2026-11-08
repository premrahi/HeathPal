import 'dotenv/config';
import mongoose from 'mongoose';
import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { config, validateEnvironment } from './config/env.js';

try {
  validateEnvironment();
  await connectDatabase(config.mongoUri);
  const port = config.port;
  if (config.mailMode === 'console') console.log('Development email codes are printed in this terminal.');
  const server = app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
  server.on('error', async (error) => {
    console.error('HTTP startup failed:', error.message);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
  let stopping = false;
  async function shutdown() {
    if (stopping) return;
    stopping = true;
    const timeout = setTimeout(() => process.exit(1), 10000);
    timeout.unref();
    server.close(async () => {
      await mongoose.disconnect();
      clearTimeout(timeout);
    });
  }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} catch (error) {
  console.error('API startup failed:', error.message);
  process.exitCode = 1;
}
