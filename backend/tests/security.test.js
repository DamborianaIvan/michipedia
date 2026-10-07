import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { validateCredentials, validateRegistration } from '../utils/credentials.js';

process.env.JWT_SECRET = 'test-only-secret-not-used-in-production-12345';
const { app } = await import('../server.js');

test('rechaza cuerpos nulos, arrays e inyección de operadores', () => {
  for (const body of [null, [], 'text', {}, { email: { $ne: null }, password: '12345678' }, { email: 'a@b.com', password: { $gt: '' } }]) {
    assert.ok(validateCredentials(body).error);
    assert.ok(validateRegistration(body).error);
  }
  assert.ok(validateCredentials({ email: 'a'.repeat(255) + '@b.com', password: '12345678' }).error);
  assert.ok(validateCredentials({ email: 'a@b.com', password: 'á'.repeat(37) }).error);
});

test('HTTP: salud, CORS, JSON inválido, límites y autenticación sin token', async () => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const health = await fetch(`${base}/api/health`);
    assert.equal(health.status, 200);
    assert.equal(health.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(health.headers.get('cache-control'), 'no-store');
    assert.equal(health.headers.get('x-powered-by'), null);
    assert.equal((await fetch(`${base}/api/auth/me`)).status, 401);
    assert.equal((await fetch(`${base}/api/auth/me`, { headers: { Authorization: 'Bearer malformed' } })).status, 401);
    const post = body => fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    assert.equal((await post('{')).status, 400);
    assert.equal((await post('null')).status, 400);
    assert.equal((await post(JSON.stringify({ email: { $ne: null }, password: '12345678' }))).status, 400);
    assert.equal((await post(JSON.stringify({ email: 'x'.repeat(17000) }))).status, 413);
    const denied = await fetch(`${base}/api/health`, { headers: { Origin: 'https://untrusted.example' } });
    assert.equal(denied.status, 403);
    assert.equal(denied.headers.get('access-control-allow-origin'), null);
    const allowed = await fetch(`${base}/api/health`, { headers: { Origin: 'http://localhost:8081' } });
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:8081');
    for (let i = 0; i < 20; i++) await post('{}');
    const limited = await post('{}'); assert.equal(limited.status, 429); assert.ok(limited.headers.get('retry-after'));
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
