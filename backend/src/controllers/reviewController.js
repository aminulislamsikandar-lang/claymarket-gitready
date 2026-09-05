// backend/src/controllers/reviewController.js
import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';

/** Recomputes and stores a product's rating + reviewsCount after any review change. */
async function refreshProductRating(productId) {
  const reviews = await Review.find({ productId });
  const reviewsCount = reviews.length;
  const rating = reviewsCount === 0 ? 0 : Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount) * 10) / 10;
  await Product.findByIdAndUpdate(productId, { rating, reviewsCount });
}

export const listProductReviews = async (req, res) => {
  const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
  return res.json(reviews);
};

export const createReview = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Login required to leave a review.' });

  const { productId, rating, comment, orderId } = req.body;
  if (!productId || !rating) return res.status(400).json({ error: 'productId and rating are required.' });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating must be an integer 1-5.' });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  // Verified-purchase check: only allow a review if the user has a completed order for this product.
  if (orderId) {
    const order = await Order.findOne({ _id: orderId, buyerId: userId, status: 'completed' });
    if (!order) return res.status(403).json({ error: 'Order not found or not completed.' });
  }

  try {
    const review = await Review.findOneAndUpdate(
      { productId, userId },
      { productId, shopId: product.shopId, userId, userName: req.user.name, rating, comment: (comment || '').slice(0, 500), orderId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await refreshProductRating(productId);
    return res.status(201).json(review);
  } catch (err) {
    return res.status(500).json({ error: 'Could not save review.', detail: err.message });
  }
};

export const deleteReview = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Login required.' });

  const review = await Review.findOne({ _id: req.params.id, userId });
  if (!review) return res.status(404).json({ error: 'Review not found.' });

  const { productId } = review;
  await review.deleteOne();
  await refreshProductRating(productId);
  return res.status(204).send();
};
