import mongoose from 'mongoose';
import { ImageComment } from '../models/ImageComment.js';
import { Product } from '../models/Product.js';

const parseImageIndex = (value) => {
  const index = Number(value);
  return Number.isInteger(index) && index >= 0 ? index : null;
};

export const listImageComments = async (req, res) => {
  const { productId } = req.params;
  const imageIndex = parseImageIndex(req.query.imageIndex);

  if (!mongoose.isValidObjectId(productId) || imageIndex === null) {
    return res.status(400).json({ error: 'Valid productId and imageIndex are required.' });
  }

  const comments = await ImageComment.find({ productId, imageIndex })
    .sort({ createdAt: -1 })
    .lean();

  return res.json(comments);
};

export const createImageComment = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Login required to comment.' });

  const { productId, imageIndex, comment } = req.body;
  const parsedImageIndex = parseImageIndex(imageIndex);
  const text = String(comment || '').trim();

  if (!mongoose.isValidObjectId(productId) || parsedImageIndex === null || !text) {
    return res.status(400).json({ error: 'productId, imageIndex and comment are required.' });
  }
  if (text.length > 500) {
    return res.status(400).json({ error: 'Comment must be 500 characters or fewer.' });
  }

  const product = await Product.findById(productId).select('images');
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  if (!Array.isArray(product.images) || parsedImageIndex >= product.images.length) {
    return res.status(400).json({ error: 'That product image does not exist.' });
  }

  try {
    const saved = await ImageComment.create({
      productId,
      imageIndex: parsedImageIndex,
      userId,
      userName: String(req.user.name || 'Claymarket User').slice(0, 120),
      comment: text,
    });
    return res.status(201).json(saved);
  } catch (err) {
    return res.status(500).json({ error: 'Could not save comment.', detail: err.message });
  }
};

export const deleteImageComment = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Login required.' });

  const comment = await ImageComment.findOne({ _id: req.params.id, userId });
  if (!comment) return res.status(404).json({ error: 'Comment not found.' });

  await comment.deleteOne();
  return res.status(204).send();
};
