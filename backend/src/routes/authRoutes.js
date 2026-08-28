import { Router } from 'express';
import { register, login, resolveLogin, me } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';
const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/resolve-login', resolveLogin);
router.get('/me', authenticateUser, me);
export default router;
