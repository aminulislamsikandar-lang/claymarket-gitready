import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.js';
import { createReview, listProductReviews, listShopReviews } from '../controllers/reviewController.js';
const router = Router();
router.get('/product/:productId', listProductReviews);
router.get('/shop/:shopId', listShopReviews);
router.post('/', authenticateUser, createReview);
export default router;
