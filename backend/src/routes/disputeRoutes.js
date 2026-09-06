// backend/src/routes/disputeRoutes.js
import { Router } from 'express';
import { createDispute, listMyDisputes, listShopDisputes, respondToDispute } from '../controllers/disputeController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateUser, createDispute);
router.get('/mine', authenticateUser, listMyDisputes);
router.get('/shop/:shopId', authenticateUser, listShopDisputes); // add seller-ownership check in requireAuth or here
router.patch('/:id', authenticateUser, respondToDispute);

export default router;
