import { Market } from '../models/Market.js';
import { ok } from '../utils/apiResponse.js';
export const listMarkets = async (req, res) => ok(res, await Market.find().sort({ name: 1 }));
export const getMarket = async (req, res) => {
  const market = await Market.findById(req.params.id);
  if (!market) return res.status(404).json({ success: false, message: 'Market not found.' });
  return ok(res, market);
};
