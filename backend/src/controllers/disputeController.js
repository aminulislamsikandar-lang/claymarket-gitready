// backend/src/controllers/disputeController.js
import { Dispute } from '../models/Dispute.js';
import { Order } from '../models/Order.js';

// Disputes can only be raised within this many days of an order being marked completed.
const DISPUTE_WINDOW_DAYS = 7;

export const createDispute = async (req, res) => {
  const buyerId = req.user?.id;
  if (!buyerId) return res.status(401).json({ error: 'Login required.' });

  const { orderId, reason, description } = req.body;
  if (!orderId || !reason || !description) {
    return res.status(400).json({ error: 'orderId, reason and description are required.' });
  }

  const order = await Order.findOne({ _id: orderId, buyerId });
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  const completedAt = order.updatedAt || order.createdAt;
  const daysSinceCompletion = (Date.now() - new Date(completedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCompletion > DISPUTE_WINDOW_DAYS) {
    return res.status(400).json({ error: `Disputes must be raised within ${DISPUTE_WINDOW_DAYS} days of order completion.` });
  }

  const existing = await Dispute.findOne({ orderId });
  if (existing) return res.status(409).json({ error: 'A dispute already exists for this order.', dispute: existing });

  const dispute = await Dispute.create({ orderId, buyerId, shopId: order.shopId, reason, description });
  return res.status(201).json(dispute);
};

export const listMyDisputes = async (req, res) => {
  const buyerId = req.user?.id;
  if (!buyerId) return res.status(401).json({ error: 'Login required.' });
  const disputes = await Dispute.find({ buyerId }).sort({ createdAt: -1 });
  return res.json(disputes);
};

export const listShopDisputes = async (req, res) => {
  // Seller viewing disputes against their own shop.
  const disputes = await Dispute.find({ shopId: req.params.shopId }).sort({ createdAt: -1 });
  return res.json(disputes);
};

export const respondToDispute = async (req, res) => {
  const { sellerResponse, status } = req.body;
  const allowedStatuses = ['seller_responded', 'resolved_refund', 'resolved_replacement', 'resolved_denied'];
  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }
  const dispute = await Dispute.findByIdAndUpdate(
    req.params.id,
    { ...(sellerResponse && { sellerResponse }), ...(status && { status }) },
    { new: true }
  );
  if (!dispute) return res.status(404).json({ error: 'Dispute not found.' });
  return res.json(dispute);
};
