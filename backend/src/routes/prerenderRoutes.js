import { Router } from 'express';
import { prerenderProduct, prerenderShop, prerenderMarket } from '../controllers/prerenderController.js';

const router = Router();

// These are hit only by social/search-preview bots — see deploy/nginx.conf
// for the User-Agent routing that sends bots here instead of the SPA.
router.get('/products/:id', prerenderProduct);
router.get('/shops/:id', prerenderShop);
router.get('/markets/:id', prerenderMarket);

export default router;
