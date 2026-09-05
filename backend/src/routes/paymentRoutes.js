// backend/src/routes/paymentRoutes.js
import { Router } from 'express';
import { createRazorpayOrder, verifyPayment } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.post('/create-order', requireAuth, createRazorpayOrder);
router.post('/verify', requireAuth, verifyPayment);

export default router;
