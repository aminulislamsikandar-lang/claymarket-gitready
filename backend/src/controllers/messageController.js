import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Shop } from '../models/Shop.js';
import { Product } from '../models/Product.js';
import { ok, fail } from '../utils/apiResponse.js';

function canAccessConversation(conv, userId, role) {
  return role === 'admin' || conv.buyerId.toString() === userId || conv.sellerId.toString() === userId;
}

export const listConversations = async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { $or: [{ buyerId: req.user._id }, { sellerId: req.user._id }] };
  const conversations = await Conversation.find(filter).populate('buyerId', 'name avatar').populate('sellerId', 'name avatar').populate('shopId', 'name profileImage').populate('productId', 'name images price').sort({ updatedAt: -1 });
  return ok(res, conversations);
};

export const createConversation = async (req, res) => {
  const { sellerId, shopId, productId } = req.body || {};
  if (!sellerId || !shopId) return fail(res, 'sellerId and shopId are required.');
  if (req.user.role === 'guest') return fail(res, 'Sign in to message sellers.', 401);
  if (sellerId.toString() === req.user._id.toString()) return fail(res, 'You cannot message yourself.');
  const shop = await Shop.findById(shopId);
  if (!shop) return fail(res, 'Shop not found.', 404);
  if (shop.ownerId.toString() !== sellerId.toString()) return fail(res, 'Seller does not own this shop.');
  if (productId && !await Product.exists({ _id: productId, shopId })) return fail(res, 'Product does not belong to this shop.');
  let conversation = await Conversation.findOne({ buyerId: req.user._id, sellerId, shopId, ...(productId ? { productId } : {}) });
  if (!conversation) conversation = await Conversation.create({ buyerId: req.user._id, sellerId, shopId, productId });
  return ok(res, conversation, 201);
};

export const listMessages = async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) return fail(res, 'Conversation not found.', 404);
  if (!canAccessConversation(conversation, req.user._id.toString(), req.user.role)) return fail(res, 'You do not have access to this conversation.', 403);
  return ok(res, await Message.find({ conversationId: conversation._id }).populate('senderId', 'name avatar role').sort({ createdAt: 1 }));
};

export const sendMessage = async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) return fail(res, 'Conversation not found.', 404);
  if (!canAccessConversation(conversation, req.user._id.toString(), req.user.role)) return fail(res, 'You do not have access to this conversation.', 403);
  const text = String(req.body?.text || '').trim();
  if (!text) return fail(res, 'Message text is required.');
  const message = await Message.create({ conversationId: conversation._id, senderId: req.user._id, text });
  conversation.updatedAt = new Date();
  await conversation.save();
  return ok(res, await message.populate('senderId', 'name avatar role'), 201);
};
