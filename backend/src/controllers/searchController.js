import { Market } from '../models/Market.js';
import { Shop } from '../models/Shop.js';
import { Product } from '../models/Product.js';
import { ok } from '../utils/apiResponse.js';

export const searchAll = async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return ok(res, { markets: [], shops: [], products: [] });
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const [markets, shops, products] = await Promise.all([
    Market.find({ $or: [{ name: rx }, { location: rx }, { description: rx }] }).limit(10),
    Shop.find({ $or: [{ name: rx }, { description: rx }, { state: rx }, { district: rx }, { marketName: rx }, { address: rx }] }).populate('marketId', 'name slug').limit(10),
    Product.find({ status: 'published', $or: [{ name: rx }, { description: rx }, { state: rx }, { district: rx }] }).populate('shopId', 'name slug').limit(20),
  ]);
  return ok(res, { markets, shops, products });
};
