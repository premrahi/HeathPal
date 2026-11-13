import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
process.env.PLAYWRIGHT_BROWSERS_PATH ||= path.join(root, '.cache/playwright');
export default defineConfig({
  testDir: './e2e', timeout: 90000, workers: 1, fullyParallel: false,
  use: { baseURL: 'http://127.0.0.1:5173', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: [
    { command: 'node scripts/browser-server.mjs', cwd: path.join(root, 'backend'), url: 'http://127.0.0.1:5000/api/health', timeout: 300000, reuseExistingServer: false },
    { command: 'npm run dev -- --host 127.0.0.1', cwd: path.join(root, 'frontend'), url: 'http://127.0.0.1:5173', timeout: 30000, reuseExistingServer: false },
  ],
});

