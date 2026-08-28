import { Router } from 'express';
import { searchAll } from '../controllers/searchController.js';
const router = Router();
router.get('/', searchAll);
export default router;
