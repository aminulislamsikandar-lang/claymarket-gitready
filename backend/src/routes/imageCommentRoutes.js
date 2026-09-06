import { Router } from 'express';
import { listImageComments, createImageComment, deleteImageComment } from '../controllers/imageCommentController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

router.get('/products/:productId', listImageComments);
router.post('/', authenticateUser, createImageComment);
router.delete('/:id', authenticateUser, deleteImageComment);

export default router;
