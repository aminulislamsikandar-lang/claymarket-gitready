export const CLEAN_NEW_SHOP_DEFAULTS = Object.freeze({
  profileImage: '',
  coverImage: '',
  rating: 0,
  reviewsCount: 0,
  verified: false,
  followersCount: 0,
});

export function applyCleanNewShopDefaults(input = {}) {
  return {
    ...input,
    ...CLEAN_NEW_SHOP_DEFAULTS,
  };
}
