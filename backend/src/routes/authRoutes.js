import { Router } from 'express';
import { register, login, resolveLogin, me } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Keep authentication/account-resolution endpoints behind the stricter limiter.
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/resolve-login', authLimiter, resolveLogin);
router.get('/me', authenticateUser, me);

export default router;
