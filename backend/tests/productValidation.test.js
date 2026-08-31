import test from 'node:test';
import assert from 'node:assert/strict';

const ALLOWED_STATUS = new Set(['published', 'hidden']);

function validateProductInput(body = {}) {
  if (!body.name?.trim()) return 'Product name is required.';
  if (!Array.isArray(body.images) || body.images.length < 1) return 'At least one product image is required.';
  if (!body.shopId) return 'Invalid shop id.';
  if (body.price !== undefined && (!Number.isFinite(Number(body.price)) || Number(body.price) < 0)) return 'Invalid price.';
  if (body.stock !== undefined && (!Number.isInteger(Number(body.stock)) || Number(body.stock) < 0)) return 'Invalid stock.';
  if (body.originalPrice !== undefined && (!Number.isFinite(Number(body.originalPrice)) || Number(body.originalPrice) < 0)) return 'Invalid original price.';
  if (body.status !== undefined && !ALLOWED_STATUS.has(body.status)) return 'Invalid status.';
  if (body.categoryIds !== undefined && !Array.isArray(body.categoryIds)) return 'Invalid categories.';
  return null;
}

test('valid product input passes validation', () => {
  assert.equal(validateProductInput({ name: 'Clay pot', images: ['https://example.com/p.jpg'], shopId: 'shop-1', price: 100, stock: 5, status: 'published', categoryIds: [] }), null);
});

test('missing name or images is rejected', () => {
  assert.equal(validateProductInput({ images: ['x'], shopId: 'shop-1' }), 'Product name is required.');
  assert.equal(validateProductInput({ name: 'Pot', images: [], shopId: 'shop-1' }), 'At least one product image is required.');
});

test('negative price and stock are rejected', () => {
  assert.equal(validateProductInput({ name: 'Pot', images: ['x'], shopId: 'shop-1', price: -1 }), 'Invalid price.');
  assert.equal(validateProductInput({ name: 'Pot', images: ['x'], shopId: 'shop-1', stock: -1 }), 'Invalid stock.');
});

test('invalid status and category shape are rejected', () => {
  assert.equal(validateProductInput({ name: 'Pot', images: ['x'], shopId: 'shop-1', status: 'deleted' }), 'Invalid status.');
  assert.equal(validateProductInput({ name: 'Pot', images: ['x'], shopId: 'shop-1', categoryIds: 'cat-1' }), 'Invalid categories.');
});
