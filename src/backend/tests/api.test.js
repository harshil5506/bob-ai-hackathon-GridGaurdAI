const test = require('node:test');
const assert = require('node:assert');
const app = require('../src/server');

// Using Node 18+ native test runner and lightweight fetch against server instance
test('GET /api/health returns valid service status', async (t) => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.service, 'GridGuard AI Backend API');
  } finally {
    server.close();
  }
});

test('POST /api/telemetry validates missing required fields', async (t) => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asset_id: 'TF-NORTH-01' }), // intentionally missing fields
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.error.message, /Missing required fields/);
  } finally {
    server.close();
  }
});
