import { firebaseAuth } from '../config/firebase.js';
import { User } from '../models/User.js';

export async function authenticateUser(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required.' });

  try {
    const decoded = await firebaseAuth().verifyIdToken(token);
    const user = await User.findById(decoded.uid);
    if (!user) return res.status(401).json({ success: false, message: 'User profile not found.' });
    req.user = user;
    req.firebaseUser = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired Firebase session.' });
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
