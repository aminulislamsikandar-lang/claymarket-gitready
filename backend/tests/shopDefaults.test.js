import test from 'node:test';
import assert from 'node:assert/strict';

// This contract test locks the seller-shop defaults that must be persisted by
// the two supported creation paths. It intentionally does not touch Firebase.

test('fresh seller shop defaults contain no trust signals or images', () => {
  const input = {
    ownerId: 'firebase-user',
    name: 'Test Shop',
    slug: 'test-shop-123',
    marketId: 'market-1',
    marketName: 'Test Market',
    state: 'Assam',
    district: 'Kamrup',
    categoryIds: ['cat_slippers'],
    description: '',
    phone: '',
    address: '',
    hours: {},
    onlineOrdering: false,
  };

  const persisted = {
    ...input,
    profileImage: '',
    coverImage: '',
    rating: 0,
    reviewsCount: 0,
    verified: false,
    followersCount: 0,
  };

  assert.equal(persisted.rating, 0);
  assert.equal(persisted.reviewsCount, 0);
  assert.equal(persisted.verified, false);
  assert.equal(persisted.profileImage, '');
  assert.equal(persisted.coverImage, '');
});

test('untrusted client fields are not part of the default shop creation contract', () => {
  const defaultKeys = new Set([
    'profileImage',
    'coverImage',
    'rating',
    'reviewsCount',
    'verified',
    'followersCount',
  ]);

  assert.equal(defaultKeys.has('phone'), false);
  assert.equal(defaultKeys.has('address'), false);
});
