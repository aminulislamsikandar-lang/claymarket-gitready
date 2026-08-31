import crypto from 'node:crypto';
import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Shop } from '../models/Shop.js';
import { ok, fail } from '../utils/apiResponse.js';

export async function createReview(req, res) {
  const { orderId, productId, shopId, rating, comment = '' } = req.body || {};
  const numericRating = Number(rating);
  if (!orderId || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5 || (!productId && !shopId) || (productId && shopId)) {
    return fail(res, 'Order, a rating from 1 to 5, and exactly one product or shop are required.');
  }

  const order = await Order.findOne({ _id: orderId, buyerId: req.user._id, status: 'completed' });
  if (!order) return fail(res, 'Only completed orders can be reviewed.', 403);
  const itemMatch = order.items.some(i => (productId && i.productId?.toString() === String(productId)) || (shopId && i.shopId?.toString() === String(shopId)));
  if (!itemMatch) return fail(res, 'The reviewed item is not part of this order.', 403);

  // Use a deterministic review id so the same buyer cannot create multiple
  // reviews for the same completed order/item, even if requests are retried.
  const targetId = String(productId || shopId);
  const reviewId = `review_${crypto.createHash('sha256').update(`${req.user._id}:${orderId}:${targetId}`).digest('hex').slice(0, 32)}`;
  const existing = await Review.findById(reviewId);
  if (existing) return fail(res, 'You have already reviewed this item for this order.', 409);

  const review = await Review.create({
    _id: reviewId,
    buyerId: req.user._id,
    orderId,
    productId: productId || undefined,
    shopId: shopId || undefined,
    rating: numericRating,
    comment: String(comment).trim().slice(0, 2000),
  });

  if (productId) {
    const p = await Product.findById(productId);
    if (p) {
      const stats = await Review.aggregate([{ $match: { productId: p._id } }, { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }]);
      p.reviewsCount = stats[0]?.count || 0;
      p.rating = stats[0]?.avg || 0;
      await p.save();
    }
  }
  if (shopId) {
    const s = await Shop.findById(shopId);
    if (s) {
      const stats = await Review.aggregate([{ $match: { shopId: s._id } }, { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }]);
      s.reviewsCount = stats[0]?.count || 0;
      s.rating = stats[0]?.avg || 0;
      await s.save();
    }
  }
  return ok(res, review, 201);
}

export async function listProductReviews(req, res) { return ok(res, await Review.find({ productId: req.params.productId }).populate('buyerId', 'name avatar').sort({ createdAt: -1 })); }
export async function listShopReviews(req, res) { return ok(res, await Review.find({ shopId: req.params.shopId }).populate('buyerId', 'name avatar').sort({ createdAt: -1 })); }
