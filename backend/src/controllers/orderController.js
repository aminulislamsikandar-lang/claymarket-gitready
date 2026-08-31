import crypto from 'node:crypto';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { ok, fail } from '../utils/apiResponse.js';

const orderNumber = () => `CLM-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
const STATUS_TRANSITIONS = {
  pending: new Set(['confirmed', 'cancelled']),
  confirmed: new Set(['ready_for_pickup', 'cancelled']),
  ready_for_pickup: new Set(['completed', 'cancelled']),
  completed: new Set(),
  cancelled: new Set(),
};

export async function createOrder(req, res) {
  const { items, deliveryType = 'pickup', address = '' } = req.body || {};
  if (!Array.isArray(items) || !items.length) return fail(res, 'At least one cart item is required.');
  if (!['pickup','delivery'].includes(deliveryType)) return fail(res, 'Invalid delivery type.');
  if (deliveryType === 'delivery' && !String(address).trim()) return fail(res, 'Delivery address is required.');
  if (items.length > 50) return fail(res, 'Too many items in one order.');

  const ids = items.map(i => i?.productId);
  if (ids.some(id => !Boolean(id))) return fail(res, 'Invalid product id.');
  const products = await Product.find({ _id: { $in: ids }, status: 'published' });
  const byId = new Map(products.map(p => [p._id.toString(), p]));
  const normalized = [];
  let total = 0;

  for (const item of items) {
    const product = byId.get(String(item.productId));
    const quantity = Number(item.quantity);
    if (!product) return fail(res, 'One or more products are unavailable.', 409);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) return fail(res, 'Invalid quantity.');
    if (Number.isFinite(product.stock) && product.stock < quantity) return fail(res, `Insufficient stock for ${product.name}.`, 409);
    const unitPrice = Number(product.price);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) return fail(res, `Price is not available for ${product.name}. Please contact the seller.`, 409);
    total += unitPrice * quantity;
    normalized.push({ productId: product._id, shopId: product.shopId, sellerId: product.sellerId, name: product.name, image: product.images?.find(i => i.isPrimary)?.url || product.images?.[0]?.url || '', unitPrice, quantity, selectedSize: String(item.selectedSize || ''), selectedColor: String(item.selectedColor || '') });
  }

  const order = await Order.create({ orderNumber: orderNumber(), buyerId: req.user._id, items: normalized, totalAmount: total, deliveryType, address: String(address || '').trim() });
  return ok(res, order, 201);
}

export async function listBuyerOrders(req, res) {
  return ok(res, await Order.find({ buyerId: req.user._id }).sort({ createdAt: -1 }).populate('items.shopId', 'name slug').populate('items.productId', 'name images'));
}

export async function listSellerOrders(req, res) {
  const orders = await Order.find({ 'items.sellerId': req.user._id }).sort({ createdAt: -1 }).populate('buyerId', 'name phone').populate('items.shopId', 'name slug').populate('items.productId', 'name images');
  return ok(res, orders);
}

export async function updateOrderStatus(req, res) {
  const allowed = ['pending','confirmed','ready_for_pickup','completed','cancelled'];
  if (!allowed.includes(req.body?.status)) return fail(res, 'Invalid order status.');
  const order = await Order.findById(req.params.id);
  if (!order) return fail(res, 'Order not found.', 404);
  const ownsItem = order.items.some(i => i.sellerId.toString() === req.user._id.toString());
  if (req.user.role !== 'admin' && !ownsItem) return fail(res, 'You can only update your own orders.', 403);

  const nextStatus = req.body.status;
  if (req.user.role !== 'admin' && !STATUS_TRANSITIONS[order.status]?.has(nextStatus)) {
    return fail(res, `Cannot change order status from ${order.status} to ${nextStatus}.`, 409);
  }

  order.status = nextStatus;
  await order.save();
  return ok(res, order);
}
