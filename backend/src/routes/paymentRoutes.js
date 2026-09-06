// backend/src/routes/paymentRoutes.js
import { Router } from 'express';
import { createRazorpayOrder, verifyPayment } from '../controllers/paymentController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

router.post('/create-order', authenticateUser, createRazorpayOrder);
router.post('/verify', authenticateUser, verifyPayment);

export default router;
