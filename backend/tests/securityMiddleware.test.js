import test from 'node:test';
import assert from 'node:assert/strict';
import { requireRole } from '../src/middleware/auth.js';
import { authLimiter } from '../src/middleware/rateLimit.js';

function responseDouble() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
    setHeader(name, value) { this.headers[name] = value; return this; },
  };
}

test('requireRole allows an authorized role', () => {
  const req = { user: { role: 'seller' } };
  const res = responseDouble();
  let called = false;
  requireRole('seller')(req, res, () => { called = true; });
  assert.equal(called, true);
  assert.equal(res.statusCode, 200);
});

test('requireRole rejects an unauthorized role', () => {
  const req = { user: { role: 'buyer' } };
  const res = responseDouble();
  let called = false;
  requireRole('seller')(req, res, () => { called = true; });
  assert.equal(called, false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.success, false);
});

test('authLimiter rejects requests after the configured threshold', () => {
  const uniqueIp = `198.51.100.${Math.floor(Math.random() * 200) + 1}`;
  let rejected = false;

  for (let i = 0; i < 30; i += 1) {
    const req = { ip: uniqueIp, baseUrl: '/test-auth' };
    const res = responseDouble();
    let nextCalled = false;
    authLimiter(req, res, () => { nextCalled = true; });
    assert.equal(nextCalled, true);
  }

  const req = { ip: uniqueIp, baseUrl: '/test-auth' };
  const res = responseDouble();
  authLimiter(req, res, () => {});
  rejected = res.statusCode === 429;

  assert.equal(rejected, true);
  assert.ok(Number(res.headers['Retry-After']) > 0);
});
