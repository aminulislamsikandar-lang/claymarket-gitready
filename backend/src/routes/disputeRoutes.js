// backend/src/routes/disputeRoutes.js
import { Router } from 'express';
import { createDispute, listMyDisputes, listShopDisputes, respondToDispute } from '../controllers/disputeController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.post('/', requireAuth, createDispute);
router.get('/mine', requireAuth, listMyDisputes);
router.get('/shop/:shopId', requireAuth, listShopDisputes); // add seller-ownership check in requireAuth or here
router.patch('/:id', requireAuth, respondToDispute);

export default router;
