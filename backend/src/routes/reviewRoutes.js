// backend/src/routes/reviewRoutes.js
import { Router } from 'express';
import { listProductReviews, createReview, deleteReview } from '../controllers/reviewController.js';
// requireAuth is your existing auth middleware — same one used to protect
// order/profile routes. Adjust the import path to match your project.
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.get('/products/:productId', listProductReviews); // public — anyone can read reviews
router.post('/', requireAuth, createReview);
router.delete('/:id', requireAuth, deleteReview);

export default router;
