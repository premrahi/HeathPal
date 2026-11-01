import 'dotenv/config';
import mongoose from 'mongoose';
import { app } from './app.js';
import { connectDatabase } from './config/database.js';

try {
  await connectDatabase(process.env.MONGO_URI);
  const port = Number(process.env.PORT) || 5000;
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
