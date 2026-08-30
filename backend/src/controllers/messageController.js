import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Shop } from '../models/Shop.js';
import { Product } from '../models/Product.js';
import { ok, fail } from '../utils/apiResponse.js';

const authUserId = (req) => String(req.firebaseUser?.uid || req.user?._id || '');
const valueId = (value) => String(value?._id || value || '');

function canAccessConversation(conv, userId, role) {
  if (role === 'admin') return true;
  const uid = String(userId || '');
  return uid && (valueId(conv?.buyerId) === uid || valueId(conv?.sellerId) === uid);
}

export const listConversations = async (req, res) => {
  const userId = authUserId(req);
  if (!userId) return fail(res, 'Authentication required.', 401);

  const filter = req.user.role === 'admin'
    ? {}
    : { $or: [{ buyerId: userId }, { sellerId: userId }] };

  const conversations = await Conversation.find(filter)
    .populate('buyerId', 'name avatar')
    .populate('sellerId', 'name avatar')
    .populate('shopId', 'name profileImage')
    .populate('productId', 'name images price')
    .sort({ updatedAt: -1 });

  return ok(res, conversations);
};

export const createConversation = async (req, res) => {
  const { shopId, productId } = req.body || {};
  const requestedSellerId = String(req.body?.sellerId || '').trim();
  const buyerId = authUserId(req);

  if (!buyerId) return fail(res, 'Authentication required.', 401);
  if (!shopId) return fail(res, 'shopId is required.');

  const shop = await Shop.findById(String(shopId));

  // The frontend can already have a valid Firebase shop while the backend's
  // shop collection is temporarily missing/stale. Messaging must not become
  // unusable just because that reference record is unavailable. Prefer the
  // shop owner when present, otherwise use the authenticated frontend-provided
  // seller id and let conversation access control protect the thread.
  const sellerId = valueId(shop?.ownerId) || requestedSellerId;
  if (!sellerId) {
    return fail(res, 'This shop does not have a seller assigned.');
  }
  if (sellerId === buyerId) return fail(res, 'You cannot message yourself.');

  // Product attachment is optional for messaging. Some products exist only in
  // the browser-side Firestore data, so an unknown product must not prevent a
  // buyer from starting a normal seller conversation.
  let validProductId = '';
  if (productId) {
    const exists = await Product.exists({ _id: String(productId), shopId: String(shopId) });
    if (exists) validProductId = String(productId);
  }

  // Reuse the shop conversation even when a product attachment is unavailable.
  // This keeps the direct-seller chat stable across product/detail entry points.
  const baseFilter = {
    buyerId,
    sellerId,
    shopId: String(shopId),
  };

  let conversation = validProductId
    ? await Conversation.findOne({ ...baseFilter, productId: validProductId })
    : await Conversation.findOne(baseFilter);

  if (!conversation) {
    conversation = await Conversation.create({
      ...baseFilter,
      ...(validProductId ? { productId: validProductId } : {}),
    });
  }

  return ok(res, conversation, 201);
};

export const listMessages = async (req, res) => {
  const userId = authUserId(req);
  if (!userId) return fail(res, 'Authentication required.', 401);

  const conversation = await Conversation.findById(String(req.params.id));
  if (!conversation) return fail(res, 'Conversation not found.', 404);

  if (!canAccessConversation(conversation, userId, req.user.role)) {
    return fail(res, 'You do not have access to this conversation.', 403);
  }

  const messages = await Message.find({ conversationId: conversation._id })
    .populate('senderId', 'name avatar role')
    .sort({ createdAt: 1 });

  return ok(res, messages);
};

export const sendMessage = async (req, res) => {
  const userId = authUserId(req);
  if (!userId) return fail(res, 'Authentication required.', 401);

  const conversationId = String(req.params.id || '').trim();
  const text = String(req.body?.text || '').trim();
  if (!conversationId) return fail(res, 'Conversation ID is required.');
  if (!text) return fail(res, 'Message text is required.');

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return fail(res, 'Conversation not found.', 404);

  if (!canAccessConversation(conversation, userId, req.user.role)) {
    return fail(res, 'You do not have access to this conversation.', 403);
  }

  const message = await Message.create({
    conversationId,
    senderId: userId,
    text,
  });

  conversation.updatedAt = new Date();
  await conversation.save();

  return ok(res, await message.populate('senderId', 'name avatar role'), 201);
};
