import test from 'node:test';
import assert from 'node:assert/strict';

function canAccessOrder(user, order) {
  if (user.role === 'admin') return true;
  if (String(order.buyerId) === String(user._id)) return true;
  return Array.isArray(order.items) && order.items.some(item => String(item.sellerId) === String(user._id));
}

function canUpdateOrder(user, order) {
  if (user.role === 'admin') return true;
  return Array.isArray(order.items) && order.items.some(item => String(item.sellerId) === String(user._id));
}

const order = {
  buyerId: 'buyer-1',
  items: [{ sellerId: 'seller-1', productId: 'product-1' }],
};

test('buyer can access their own order', () => {
  assert.equal(canAccessOrder({ _id: 'buyer-1', role: 'buyer' }, order), true);
});

test('buyer cannot access another buyer order', () => {
  assert.equal(canAccessOrder({ _id: 'buyer-2', role: 'buyer' }, order), false);
});

test('seller can access an order containing their item', () => {
  assert.equal(canAccessOrder({ _id: 'seller-1', role: 'seller' }, order), true);
});

test('seller cannot update an order containing another seller item', () => {
  assert.equal(canUpdateOrder({ _id: 'seller-2', role: 'seller' }, order), false);
});

test('admin can access and update any order', () => {
  const admin = { _id: 'admin-1', role: 'admin' };
  assert.equal(canAccessOrder(admin, order), true);
  assert.equal(canUpdateOrder(admin, order), true);
});
