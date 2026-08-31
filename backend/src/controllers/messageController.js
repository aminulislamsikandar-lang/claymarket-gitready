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

  try {
    const shop = await Shop.findById(String(shopId));
    const sellerId = valueId(shop?.ownerId) || requestedSellerId;
    if (!sellerId) return fail(res, 'This shop does not have a seller assigned.');
    if (sellerId === buyerId) return fail(res, 'You cannot message yourself.');

    let validProductId = '';
    if (productId) {
      const exists = await Product.exists({ _id: String(productId), shopId: String(shopId) });
      if (exists) validProductId = String(productId);
    }

    const baseFilter = { buyerId, sellerId, shopId: String(shopId) };
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
  } catch (error) {
    console.error(`[${req.id || 'no-request-id'}] createConversation failed:`, {
      code: error?.code,
      message: error?.message,
      name: error?.name,
      shopId: String(shopId),
      productId: productId ? String(productId) : undefined,
      buyerId,
    });
    throw error;
  }
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

  let conversationId = String(req.params.id || '').trim();
  const text = String(req.body?.text || '').trim();
  if (!conversationId) return fail(res, 'Conversation ID is required.');
  if (!text) return fail(res, 'Message text is required.');

  // The UI may optimistically open a new thread with conv_pending_<shopId>_<timestamp>.
  // Resolve that temporary id on the server too, so an early Quick Inquiry/send
  // cannot be lost even if it races the POST /conversations request.
  if (conversationId.startsWith('conv_pending_')) {
    const parts = conversationId.split('_');
    const shopId = parts.slice(2, -1).join('_');
    if (shopId) {
      const shop = await Shop.findById(shopId);
      const sellerId = valueId(shop?.ownerId);
      if (!sellerId || sellerId === userId) return fail(res, 'This shop does not have a seller assigned.');
      let conversation = await Conversation.findOne({ buyerId: userId, sellerId, shopId });
      if (!conversation) conversation = await Conversation.create({ buyerId: userId, sellerId, shopId });
      conversationId = String(conversation._id);
    }
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return fail(res, 'Conversation not found.', 404);

  if (!canAccessConversation(conversation, userId, req.user.role)) {
    return fail(res, 'You do not have access to this conversation.', 403);
  }

  const message = await Message.create({ conversationId, senderId: userId, text });
  conversation.updatedAt = new Date();
  await conversation.save();

  return ok(res, await message.populate('senderId', 'name avatar role'), 201);
};
