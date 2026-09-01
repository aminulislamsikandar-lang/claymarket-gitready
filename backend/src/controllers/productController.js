import { Product } from '../models/Product.js';
import { Shop } from '../models/Shop.js';
import { Market } from '../models/Market.js';
import { firestore } from '../config/firebase.js';
import { ok, fail } from '../utils/apiResponse.js';

const publicFilter = { status: 'published' };
const PRODUCT_STATUSES = new Set(['published', 'hidden']);

function validateProductValues(product) {
  if (!Number.isFinite(Number(product.price)) || Number(product.price) < 0) return 'Product price must be a non-negative number.';
  if (!Number.isInteger(Number(product.stock)) || Number(product.stock) < 0) return 'Product stock must be a non-negative integer.';
  if (product.originalPrice != null && (!Number.isFinite(Number(product.originalPrice)) || Number(product.originalPrice) < 0)) return 'Original price must be a non-negative number.';
  if (!PRODUCT_STATUSES.has(product.status)) return 'Status must be published or hidden.';
  if (!Array.isArray(product.images) || product.images.length < 1) return 'At least one product image is required.';
  return null;
}

export const listProducts = async (req, res) => {
  const filter = { ...publicFilter };
  const shopId = req.query.shopId || req.params.shopId;
  const marketId = req.query.marketId || req.params.marketId;
  const categoryId = req.query.categoryId || req.params.categoryId;
  if (shopId) filter.shopId = shopId;
  if (marketId) filter.marketId = marketId;
  if (categoryId) filter.categoryIds = categoryId;
  const products = await Product.find(filter).populate('shopId', 'name slug').populate('marketId', 'name slug').populate('categoryIds', 'name slug').sort({ createdAt: -1 });
  return ok(res, products);
};

export const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('shopId', 'name slug ownerId').populate('marketId', 'name slug').populate('categoryIds', 'name slug');
  if (!product) return fail(res, 'Product not found.', 404);
  if (product.status === 'hidden' && (!req.user || (req.user.role !== 'admin' && product.sellerId.toString() !== req.user._id.toString()))) return fail(res, 'Product not found.', 404);
  return ok(res, product);
};

export const searchProducts = async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return ok(res, []);
  const products = await Product.find({ ...publicFilter, $text: { $search: q } }).populate('shopId', 'name slug').populate('marketId', 'name slug').limit(30);
  return ok(res, products);
};

export const createProduct = async (req, res) => {
  const {
    shopId, marketId, categoryIds = [], name, images = [],
    sellerId: _sellerId, _id: _id, id: _idAlias, createdAt: _createdAt,
    updatedAt: _updatedAt, status = 'published', ...rest
  } = req.body || {};
  if (!name?.trim()) return fail(res, 'Product name is required.');
  if (!Array.isArray(images) || images.length < 1) return fail(res, 'At least one product image is required.');
  if (!Boolean(shopId)) return fail(res, 'Invalid shop id.');
  if (!Array.isArray(categoryIds)) return fail(res, 'Category ids must be an array.');
  const shop = await Shop.findById(shopId);
  if (!shop) return fail(res, 'Shop not found.', 404);
  if (req.user.role !== 'admin' && shop.ownerId.toString() !== req.user._id.toString()) return fail(res, 'You can only add products to your own shop.', 403);
  const actualMarketId = marketId || shop.marketId;
  if (!Boolean(actualMarketId) || !await Market.exists({ _id: actualMarketId })) return fail(res, 'Market not found.', 404);
  if (shop.marketId.toString() !== actualMarketId.toString()) return fail(res, 'Product market must match the shop market.');
  const normalizedImages = images.map((image, index) => typeof image === 'string' ? { url: image, isPrimary: index === 0 } : image);
  const candidate = { ...rest, sellerId: req.user._id, shopId, marketId: actualMarketId, categoryIds, name: name.trim(), images: normalizedImages, status };
  const validationError = validateProductValues(candidate);
  if (validationError) return fail(res, validationError);
  const product = await Product.create(candidate);
  return ok(res, product, 201);
};

export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return fail(res, 'Product not found.', 404);
  if (req.user.role !== 'admin' && product.sellerId.toString() !== req.user._id.toString()) return fail(res, 'You can only edit your own products.', 403);
  const allowed = ['name','description','price','originalPrice','stock','sizes','colors','images','material','status','categoryIds'];
  for (const key of allowed) if (key in req.body) product[key] = req.body[key];
  if (!product.name?.trim()) return fail(res, 'Product name is required.');
  const validationError = validateProductValues(product);
  if (validationError) return fail(res, validationError);
  await product.save();
  return ok(res, product);
};

export const updateProductStatus = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return fail(res, 'Product not found.', 404);
  if (req.user.role !== 'admin' && product.sellerId.toString() !== req.user._id.toString()) return fail(res, 'You can only manage your own products.', 403);
  if (!PRODUCT_STATUSES.has(req.body.status)) return fail(res, 'Status must be published or hidden.');
  product.status = req.body.status;
  await product.save();
  return ok(res, product);
};

export const deleteProduct = async (req, res) => {
  const productId = String(req.params.id || '');
  const firebaseUid = String(req.firebaseUser?.uid || '');
  let firestoreDeleted = false;

  // The live marketplace product catalog is stored in Firestore. Delete it
  // server-side after verifying ownership so stale/mis-deployed client rules
  // cannot block a legitimate seller action.
  try {
    const db = firestore();
    const ref = db.collection('products').doc(productId);
    const snapshot = await ref.get();
    if (snapshot.exists) {
      const data = snapshot.data() || {};
      const sellerId = String(data.sellerId || '');
      const shopId = String(data.shopId || '');
      let ownerId = sellerId;

      if (shopId) {
        const shopSnapshot = await db.collection('shops').doc(shopId).get();
        if (shopSnapshot.exists) ownerId = String(shopSnapshot.data()?.ownerId || sellerId);
      }

      if (req.user.role !== 'admin' && ownerId !== firebaseUid && sellerId !== firebaseUid) {
        return fail(res, 'You can only delete your own products.', 403);
      }

      await ref.delete();
      firestoreDeleted = true;
    }
  } catch (error) {
    console.error('Firestore product deletion failed:', error);
    return fail(res, 'Unable to delete the product from the marketplace catalog.', 500);
  }

  // Preserve compatibility with older Mongo-backed products.
  if (/^[a-f\d]{24}$/i.test(productId)) {
    const product = await Product.findById(productId).catch(() => null);
    if (product) {
      if (req.user.role !== 'admin' && product.sellerId.toString() !== req.user._id.toString()) {
        return fail(res, 'You can only delete your own products.', 403);
      }
      await product.deleteOne();
      return ok(res, { deleted: true, firestore: firestoreDeleted, mongo: true });
    }
  }

  if (firestoreDeleted) return ok(res, { deleted: true, firestore: true });
  return fail(res, 'Product not found.', 404);
};
