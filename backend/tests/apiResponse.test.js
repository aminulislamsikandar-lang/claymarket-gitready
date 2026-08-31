import test from 'node:test';
import assert from 'node:assert/strict';
import { ok, fail } from '../src/utils/apiResponse.js';

function responseDouble() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

test('ok returns the standard success envelope', () => {
  const res = responseDouble();
  ok(res, { item: 'value' });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.deepEqual(res.body.data, { item: 'value' });
});

test('ok supports a custom HTTP status', () => {
  const res = responseDouble();
  ok(res, { created: true }, 201);
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.success, true);
});

test('fail returns a standard error envelope', () => {
  const res = responseDouble();
  fail(res, 'Bad request', 400);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.equal(res.body.message, 'Bad request');
});
