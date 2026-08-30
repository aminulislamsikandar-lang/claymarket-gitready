import { Shop, Market } from '../types';

// These exist purely so that `shops.find(...) || shops[0]` style fallbacks
// never resolve to `undefined` and crash the page when there are genuinely
// zero real shops/markets yet (e.g. a freshly deployed site before any
// seller has signed up, or before an admin has added a market). They are
// never rendered in a browsable list — only used as a last-resort single
// fallback object so property access like `shop.name` stays safe.

export const EMPTY_SHOP_FALLBACK: Shop = {
  id: '',
  name: 'Shop unavailable',
  marketId: '',
  marketName: '',
  categoryId: '',
  categoryName: '',
  avatar: '',
  banner: '',
  rating: 0,
  reviewsCount: 0,
  verified: false,
  followersCount: 0,
  about: '',
  phone: '',
  address: '',
  ownerId: '',
  ownerName: '',
};

export const EMPTY_MARKET_FALLBACK: Market = {
  id: '',
  name: 'Market unavailable',
  slug: '',
  bannerImage: '',
  location: '',
  description: '',
  featuredCategories: [],
};
