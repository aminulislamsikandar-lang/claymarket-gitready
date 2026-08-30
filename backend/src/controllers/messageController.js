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
  const { sellerId, shopId, productId } = req.body || {};
  const buyerId = authUserId(req);

  if (!buyerId) return fail(res, 'Authentication required.', 401);
  if (!sellerId || !shopId) return fail(res, 'sellerId and shopId are required.');
  if (String(sellerId) === buyerId) return fail(res, 'You cannot message yourself.');

  const shop = await Shop.findById(String(shopId));
  if (!shop) return fail(res, 'Shop not found.', 404);

  if (valueId(shop.ownerId) !== String(sellerId)) {
    return fail(res, 'Seller does not own this shop.');
  }

  if (productId && !(await Product.exists({ _id: String(productId), shopId: String(shopId) }))) {
    return fail(res, 'Product does not belong to this shop.');
  }

  const conversationFilter = {
    buyerId,
    sellerId: String(sellerId),
    shopId: String(shopId),
    ...(productId ? { productId: String(productId) } : {}),
  };

  let conversation = await Conversation.findOne(conversationFilter);
  if (!conversation) {
    conversation = await Conversation.create(conversationFilter);
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
