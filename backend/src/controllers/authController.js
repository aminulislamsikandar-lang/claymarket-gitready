import { firebaseAuth } from '../config/firebase.js';
import { User } from '../models/User.js';
import { Shop } from '../models/Shop.js';
import { Market } from '../models/Market.js';
import { Category } from '../models/Category.js';
import { ok, fail } from '../utils/apiResponse.js';

function normalizeEmail(email) { return String(email || '').trim().toLowerCase(); }

// Normalizes a phone number for matching purposes: strips everything except
// digits, then keeps only the last 10 digits so that "+91 98765 43210",
// "091-98765-43210" and "9876543210" are all treated as the same number.
// This is used only for lookups/comparisons — the original, user-entered
// phone value is still what gets displayed and stored as `phone`.
function normalizePhone(value) {
  const digitsOnly = String(value || '').replace(/\D/g, '');
  return digitsOnly.slice(-10);
}

async function publicUser(user) {
  const shop = user.role === 'seller'
    ? await Shop.findOne({ ownerId: user._id }).select('_id name state district marketId marketName').lean()
    : null;
  return {
    id: user._id.toString(), name: user.name, email: user.email, phone: user.phone || '',
    role: user.role, avatar: user.avatar || '', shopId: shop?._id?.toString(), shopName: shop?.name, addresses: user.addresses || [], sellerLocation: user.sellerLocation || (shop ? { state: shop.state || '', district: shop.district || '', marketId: shop.marketId?._id?.toString?.() || shop.marketId || '', marketName: shop.marketName || '' } : undefined),
  };
}

async function resolveMarket(id) {
  const value = String(id || '').trim(); if (!value) return null;
  const slug = value.startsWith('mkt_') ? value.slice(4).replace(/_/g, '-') : value;
  return Market.findOne({ $or: [{ _id: value }, { slug }, { name: value }] });
}
async function resolveCategory(id) {
  const value = String(id || '').trim(); if (!value) return null;
  const slug = value.startsWith('cat_') ? value.slice(4).replace(/_/g, '-') : value;
  return Category.findOne({ $or: [{ _id: value }, { slug }, { name: value }] });
}

// Creates Firebase Authentication credentials and the application profile in Firestore.
export async function register(req, res) {
  const { name, email, password, phone = '', role = 'buyer', shop = null } = req.body || {};
  const normalizedEmail = normalizeEmail(email);
  if (!name?.trim() || !normalizedEmail || !password) return fail(res, 'Name, email and password are required.');
  if (password.length < 8) return fail(res, 'Password must be at least 8 characters.');
  if (password.length > 128) return fail(res, 'Password is too long.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return fail(res, 'Please provide a valid email address.');
  const safeRole = ['buyer', 'seller'].includes(role) ? role : 'buyer';
  if (safeRole === 'seller') {
    if (!shop?.name?.trim()) return fail(res, 'Shop name is required for seller registration.');
    if (!shop?.state?.trim()) return fail(res, 'State is required for seller registration.');
    if (!shop?.district?.trim()) return fail(res, 'District is required for seller registration.');
    if (!shop?.marketId && !shop?.marketName?.trim()) return fail(res, 'Market name is required for seller registration.');
  }

  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) return fail(res, 'An account with this email already exists.', 409);

  let firebaseUser;
  try {
    firebaseUser = await firebaseAuth().createUser({ email: normalizedEmail, password, displayName: name.trim(), phoneNumber: String(phone || '').trim() || undefined });
  } catch (error) {
    const message = error?.code === 'auth/email-already-exists' ? 'An account with this email already exists.' : (error.message || 'Unable to create the Firebase account.');
    return fail(res, message, error?.code === 'auth/email-already-exists' ? 409 : 400);
  }

  let user;
  let createdShop = null;
  try {
    const market = safeRole === 'seller' ? await resolveMarket(shop.marketId || shop.marketName) : null;
    if (safeRole === 'seller' && !market) throw new Error('Selected market could not be found.');
    user = await User.create({
      _id: firebaseUser.uid,
      name: name.trim(),
      email: normalizedEmail,
      phone: String(phone || '').trim(),
      phoneNormalized: normalizePhone(phone),
      role: safeRole,
      avatar: '',
      addresses: [],
      ...(safeRole === 'seller' ? { sellerLocation: { state: shop.state.trim(), district: shop.district.trim(), marketId: market._id, marketName: market.name } } : {}),
    });
    if (safeRole === 'seller') {
      const category = await resolveCategory(shop.categoryId || shop.categoryName);
      if (!category) throw new Error('Selected category could not be found.');
      const slugBase = shop.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `shop-${Date.now()}`;
      createdShop = await Shop.create({ ownerId: user._id, name: shop.name.trim(), slug: `${slugBase}-${Date.now()}`, marketId: market._id, marketName: market.name, state: shop.state.trim(), district: shop.district.trim(), categoryIds: [category._id], description: shop.description || '', phone: String(shop.phone || phone || '').trim(), address: String(shop.address || '').trim() });
    }
  } catch (error) {
    if (user) await User.findByIdAndDelete(user._id);
    await firebaseAuth().deleteUser(firebaseUser.uid).catch(() => {});
    return fail(res, error.message || 'Unable to create the account profile.', 400);
  }

  return ok(res, { user: await publicUser(user), firebaseUid: firebaseUser.uid }, 201);
}

// Firebase Auth performs password verification on the client. This endpoint resolves a phone login to its email.
export async function resolveLogin(req, res) {
  const identifier = String(req.body?.identifier || '').trim();
  if (!identifier) return fail(res, 'Email or phone is required.');
  if (identifier.includes('@')) return ok(res, { email: normalizeEmail(identifier) });
  const normalized = normalizePhone(identifier);
  if (!normalized) return fail(res, 'Please enter a valid phone number.');
  let user = await User.findOne({ phoneNormalized: normalized });
  if (!user) {
    // Fall back to a raw match for accounts created before phoneNormalized
    // existed (e.g. seeded/legacy users that haven't re-saved their phone).
    user = await User.findOne({ phone: identifier });
  }
  if (!user) return fail(res, 'No account was found for this phone number.', 404);
  return ok(res, { email: user.email });
}

// Called after the frontend signs in with Firebase and sends the Firebase ID token.
export async function me(req, res) { return ok(res, { user: await publicUser(req.user) }); }

// Kept for API compatibility; password verification belongs to Firebase Authentication.
export async function login(req, res) { return fail(res, 'Use Firebase Authentication from the client to sign in.', 410); }
