import test from 'node:test';
import assert from 'node:assert/strict';

const transitions = {
  pending: new Set(['confirmed', 'cancelled']),
  confirmed: new Set(['ready_for_pickup', 'cancelled']),
  ready_for_pickup: new Set(['completed', 'cancelled']),
  completed: new Set(),
  cancelled: new Set(),
};

test('order status flow allows only forward transitions or cancellation', () => {
  assert.equal(transitions.pending.has('confirmed'), true);
  assert.equal(transitions.confirmed.has('ready_for_pickup'), true);
  assert.equal(transitions.ready_for_pickup.has('completed'), true);
  assert.equal(transitions.pending.has('completed'), false);
  assert.equal(transitions.completed.has('pending'), false);
  assert.equal(transitions.cancelled.has('confirmed'), false);
});

test('terminal order states cannot transition', () => {
  assert.equal(transitions.completed.size, 0);
  assert.equal(transitions.cancelled.size, 0);
});
