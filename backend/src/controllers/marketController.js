import { Market } from '../models/Market.js';
import { Shop } from '../models/Shop.js';
import { User } from '../models/User.js';
import { ok } from '../utils/apiResponse.js';

// A market is publicly discoverable only when it has at least one shop
// owned by a real seller account. This keeps seeded/demo-only markets out
// of the marketplace without deleting legitimate market documents.
const getActiveMarketIds = async () => {
  const sellerIds = await User.distinct('_id', { role: 'seller' });
  if (!sellerIds.length) return [];
  return Shop.distinct('marketId', { ownerId: { $in: sellerIds } });
};

export const listMarkets = async (req, res) => {
  const activeMarketIds = await getActiveMarketIds();
  if (!activeMarketIds.length) return ok(res, []);

  const markets = await Market.find({ _id: { $in: activeMarketIds } }).sort({ name: 1 });
  return ok(res, markets);
};

export const getMarket = async (req, res) => {
  const activeMarketIds = await getActiveMarketIds();
  const isActive = activeMarketIds.some(id => String(id) === String(req.params.id));
  if (!isActive) return res.status(404).json({ success: false, message: 'Market not found.' });

  const market = await Market.findById(req.params.id);
  if (!market) return res.status(404).json({ success: false, message: 'Market not found.' });
  return ok(res, market);
};
