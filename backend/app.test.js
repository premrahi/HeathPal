import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { app } from './src/app.js';

// Real HTTP requests; no external database or credentials required.
test('API returns unavailable database status and a JSON 404', async () => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const health = await fetch(`${base}/api/health`);
    assert.equal(health.status, 503);
    assert.equal((await health.json()).database, 'disconnected');
    const missing = await fetch(`${base}/api/missing`);
    assert.equal(missing.status, 404);
    assert.deepEqual(await missing.json(), { message: 'Route not found' });
    const malformed = await fetch(`${base}/api/missing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    });
    assert.equal(malformed.status, 400);
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
