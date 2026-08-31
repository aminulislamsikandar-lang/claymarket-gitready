import { firebaseAuth } from '../config/firebase.js';
import { User } from '../models/User.js';

export async function authenticateUser(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required.', requestId: req.id });

  try {
    const decoded = await firebaseAuth().verifyIdToken(token);
    const user = await User.findById(decoded.uid);
    if (!user) return res.status(401).json({ success: false, message: 'User profile not found.', requestId: req.id });
    req.user = user;
    req.firebaseUser = decoded;
    next();
  } catch (error) {
    console.error(`[${req.id || 'no-request-id'}] Firebase authentication failed:`, {
      code: error?.code,
      message: error?.message,
      name: error?.name,
    });
    return res.status(401).json({ success: false, message: 'Invalid or expired Firebase session.', requestId: req.id });
  }
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'You do not have permission for this action.' });
  }
  next();
};

export const requireSeller = requireRole('seller', 'admin');
export const requireAdmin = requireRole('admin');
