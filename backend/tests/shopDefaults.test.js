import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCleanNewShopDefaults } from '../src/utils/cleanShopDefaults.js';

test('fresh seller shop defaults contain no trust signals or images', () => {
  const persisted = applyCleanNewShopDefaults({
    ownerId: 'firebase-user',
    name: 'Test Shop',
    slug: 'test-shop-123',
    marketId: 'market-1',
    marketName: 'Test Market',
    state: 'Assam',
    district: 'Kamrup',
    categoryIds: ['cat_slippers'],
  });

  assert.equal(persisted.rating, 0);
  assert.equal(persisted.reviewsCount, 0);
  assert.equal(persisted.verified, false);
  assert.equal(persisted.followersCount, 0);
  assert.equal(persisted.profileImage, '');
  assert.equal(persisted.coverImage, '');
});

test('client-supplied trust/image fields cannot override seller creation defaults', () => {
  const persisted = applyCleanNewShopDefaults({
    name: 'Test Shop',
    rating: 4.9,
    reviewsCount: 128,
    verified: true,
    followersCount: 420,
    profileImage: 'https://example.com/demo.jpg',
    coverImage: 'https://example.com/demo-banner.jpg',
  });

  assert.deepEqual(
    {
      rating: persisted.rating,
      reviewsCount: persisted.reviewsCount,
      verified: persisted.verified,
      followersCount: persisted.followersCount,
      profileImage: persisted.profileImage,
      coverImage: persisted.coverImage,
    },
    {
      rating: 0,
      reviewsCount: 0,
      verified: false,
      followersCount: 0,
      profileImage: '',
      coverImage: '',
    },
  );
});

test('admin may explicitly supply shop metadata', () => {
  const adminShop = {
    profileImage: 'https://res.cloudinary.com/example/image/upload/v1/admin.jpg',
    coverImage: 'https://res.cloudinary.com/example/image/upload/v1/banner.jpg',
    rating: 4.8,
    reviewsCount: 30,
    verified: true,
    followersCount: 200,
  };

  assert.equal(adminShop.verified, true);
  assert.equal(adminShop.rating, 4.8);
  assert.equal(adminShop.reviewsCount, 30);
  assert.equal(adminShop.profileImage.includes('res.cloudinary.com'), true);
  assert.equal(adminShop.coverImage.includes('res.cloudinary.com'), true);
});
