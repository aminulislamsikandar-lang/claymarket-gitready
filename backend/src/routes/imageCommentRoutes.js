import { Router } from 'express';
import { listImageComments, createImageComment, deleteImageComment } from '../controllers/imageCommentController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.get('/products/:productId', listImageComments);
router.post('/', requireAuth, createImageComment);
router.delete('/:id', requireAuth, deleteImageComment);

export default router;
