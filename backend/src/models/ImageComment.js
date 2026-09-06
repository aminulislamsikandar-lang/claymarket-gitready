import mongoose from 'mongoose';

const imageCommentSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    imageIndex: { type: Number, required: true, min: 0, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true, trim: true, maxlength: 120 },
    comment: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

imageCommentSchema.index({ productId: 1, imageIndex: 1, createdAt: -1 });

export const ImageComment = mongoose.model('ImageComment', imageCommentSchema);
