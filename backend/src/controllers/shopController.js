import { Market } from '../models/Market.js';
import { Category } from '../models/Category.js';
import { Shop } from '../models/Shop.js';
import { ok, fail } from '../utils/apiResponse.js';

export const listShops = async (req, res) => {
  const filter = {};
  if (req.query.marketId) filter.marketId = req.query.marketId;
  if (req.query.categoryId) filter.categoryIds = req.query.categoryId;
  if (req.query.state) filter.state = new RegExp(String(req.query.state).trim(), 'i');
  if (req.query.district) filter.district = new RegExp(String(req.query.district).trim(), 'i');
  if (req.query.marketName) filter.marketName = new RegExp(String(req.query.marketName).trim(), 'i');
  const shops = await Shop.find(filter).populate('marketId', 'name slug').populate('categoryIds', 'name slug').sort({ name: 1 });
  return ok(res, shops);
};

export const getShop = async (req, res) => {
  const shop = await Shop.findById(req.params.id).populate('marketId', 'name slug').populate('categoryIds', 'name slug').populate('ownerId', 'name email avatar');
  if (!shop) return fail(res, 'Shop not found.', 404);
  return ok(res, shop);
};

export const createShop = async (req, res) => {
  const { name, marketId, categoryIds = [], profileImage = '', coverImage = '', description = '', phone = '', address = '', hours = {}, state = '', district = '' } = req.body || {};
  if (!name || !marketId) return fail(res, 'Shop name and market are required.');
  if (req.user.role !== 'seller' && req.user.role !== 'admin') return fail(res, 'Seller access required.', 403);
  if (!await Market.exists({ _id: marketId })) return fail(res, 'Market not found.', 404);
  if (categoryIds.length && await Category.countDocuments({ _id: { $in: categoryIds } }) !== categoryIds.length) return fail(res, 'One or more categories are invalid.');
  const slugBase = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const slug = `${slugBase}-${Date.now()}`;
  const market = await Market.findById(marketId);
  const shop = await Shop.create({ ownerId: req.user._id, name, slug, marketId, marketName: market?.name || '', state: String(state).trim(), district: String(district).trim(), categoryIds, profileImage, coverImage, description, phone, address, hours });
  return ok(res, await shop.populate('marketId', 'name slug'), 201);
};

export const updateShop = async (req, res) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) return fail(res, 'Shop not found.', 404);
  if (req.user.role !== 'admin' && shop.ownerId.toString() !== req.user._id.toString()) return fail(res, 'You can only edit your own shop.', 403);
  const allowed = ['name','marketId','marketName','state','district','categoryIds','profileImage','coverImage','description','phone','address','hours'];
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
