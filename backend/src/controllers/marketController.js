import { Market } from '../models/Market.js';
import { Shop } from '../models/Shop.js';
import { ok } from '../utils/apiResponse.js';

// Public markets must be backed by a real shop. Do not depend on the seller
// profile's role field here: legacy data and older onboarding flows can leave
// a legitimate shop while the corresponding user profile is stale. The shop
// itself is the source of truth for whether a market has marketplace content.
// Known historical demo fixtures are excluded explicitly so this does not
// bring seeded/demo-only markets back into the public UI.
const LEGACY_MARKET_IDS = new Set(['mkt_kachumara']);
const LEGACY_SHOP_IDS = new Set(['shop_aminul']);

const getActiveMarketIds = async () => {
  const shops = await Shop.find({});
  return [...new Set(
    shops
      .filter(shop => {
        const shopId = String(shop._id || '');
        const marketId = String(shop.marketId || '');
        return Boolean(marketId) && !LEGACY_SHOP_IDS.has(shopId) && !LEGACY_MARKET_IDS.has(marketId);
      })
      .map(shop => String(shop.marketId))
      .filter(Boolean),
  )];
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
