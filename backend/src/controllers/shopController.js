import { Market } from '../models/Market.js';
import { Category } from '../models/Category.js';
import { Shop } from '../models/Shop.js';
import { ok, fail } from '../utils/apiResponse.js';

const MAX_SEARCH_LENGTH = 80;
const MAX_PAGE_SIZE = 50;
const escapeRegex = (value) => String(value).slice(0, MAX_SEARCH_LENGTH).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const parsePage = (value) => Math.max(1, Number.parseInt(value, 10) || 1);
const parseLimit = (value) => Math.min(MAX_PAGE_SIZE, Math.max(1, Number.parseInt(value, 10) || 20));

export const listShops = async (req, res) => {
  const filter = {};
  if (req.query.marketId) filter.marketId = req.query.marketId;
  if (req.query.categoryId) filter.categoryIds = req.query.categoryId;
  if (req.query.state) filter.state = new RegExp(escapeRegex(req.query.state), 'i');
  if (req.query.district) filter.district = new RegExp(escapeRegex(req.query.district), 'i');
  if (req.query.marketName) filter.marketName = new RegExp(escapeRegex(req.query.marketName), 'i');
  const page = parsePage(req.query.page);
  const limit = parseLimit(req.query.limit);
  const shops = await Shop.find(filter).populate('marketId', 'name slug').populate('categoryIds', 'name slug').sort({ name: 1 }).skip((page - 1) * limit).limit(limit);
  const total = await Shop.countDocuments(filter);
  const pagination = { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPreviousPage: page > 1 };
  res.set('X-Pagination', JSON.stringify(pagination));
  return ok(res, shops);
};

export const getShop = async (req, res) => {
  const shop = await Shop.findById(req.params.id).populate('marketId', 'name slug').populate('ownerId', 'name email avatar');
  if (!shop) return fail(res, 'Shop not found.', 404);
  return ok(res, shop);
};

export const createShop = async (req, res) => {
  const { name, marketId, categoryIds = [], profileImage = '', coverImage = '', description = '', phone = '', address = '', hours = {}, state = '', district = '', onlineOrdering = false } = req.body || {};
  if (!name || !marketId) return fail(res, 'Shop name and market are required.');
  if (req.user.role !== 'seller' && req.user.role !== 'admin') return fail(res, 'Seller access required.', 403);
  if (typeof onlineOrdering !== 'boolean') return fail(res, 'onlineOrdering must be true or false.');

  // A Claymarket seller owns exactly one shop. The older API allowed a new
  // Firestore document to be created on every request, which could produce
  // multiple shops for the same Firebase user. Refuse duplicate creation.
  if (req.user.role === 'seller') {
    const existingShops = await Shop.find({ ownerId: req.user._id }).limit(1);
    if (existingShops.length) return fail(res, 'You already have a shop. Each seller can have only one shop.', 409);
  }

  if (!await Market.exists({ _id: marketId })) return fail(res, 'Market not found.', 404);
  if (categoryIds.length && await Category.countDocuments({ _id: { $in: categoryIds } }) !== categoryIds.length) return fail(res, 'One or more categories are invalid.');
  const slugBase = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const slug = `${slugBase}-${Date.now()}`;
  const market = await Market.findById(marketId);
  const shop = await Shop.create({ ownerId: req.user._id, name, slug, marketId, marketName: market?.name || '', state: String(state).trim(), district: String(district).trim(), categoryIds, profileImage, coverImage, description, phone, address, hours, onlineOrdering });
  return ok(res, await shop.populate('marketId', 'name slug'), 201);
};

export const updateShop = async (req, res) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) return fail(res, 'Shop not found.', 404);
  if (req.user.role !== 'admin' && shop.ownerId.toString() !== req.user._id.toString()) return fail(res, 'You can only edit your own shop.', 403);
  const allowed = ['name','marketId','marketName','state','district','categoryIds','profileImage','coverImage','description','phone','address','hours','onlineOrdering'];
  if ('marketId' in req.body) {
    if (!await Market.exists({ _id: req.body.marketId })) return fail(res, 'Market not found.', 404);
    shop.marketId = req.body.marketId;
    const market = await Market.findById(req.body.marketId);
    shop.marketName = market?.name || shop.marketName || '';
  }
  if ('categoryIds' in req.body) {
    const ids = Array.isArray(req.body.categoryIds) ? req.body.categoryIds : [];
    if (ids.length && await Category.countDocuments({ _id: { $in: ids } }) !== ids.length) return fail(res, 'One or more categories are invalid.');
    shop.categoryIds = ids;
  }
  if ('onlineOrdering' in req.body && typeof req.body.onlineOrdering !== 'boolean') return fail(res, 'onlineOrdering must be true or false.');
  for (const key of allowed.filter(k => !['marketId','categoryIds'].includes(k))) if (key in req.body) shop[key] = req.body[key];
  await shop.save();
  return ok(res, await shop.populate('marketId', 'name slug'));
};

export const deleteShop = async (req, res) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) return fail(res, 'Shop not found.', 404);
  if (req.user.role !== 'admin' && shop.ownerId.toString() !== req.user._id.toString()) return fail(res, 'You can only delete your own shop.', 403);
  await shop.deleteOne();
  return ok(res, { deleted: true });
};
