// backend/src/models/Dispute.js
import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    reason: {
      type: String,
      required: true,
      enum: ['item_not_received', 'item_damaged', 'item_not_as_described', 'wrong_item', 'other'],
    },
    description: { type: String, required: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ['open', 'seller_responded', 'resolved_refund', 'resolved_replacement', 'resolved_denied', 'closed'],
      default: 'open',
    },
    sellerResponse: { type: String, maxlength: 1000 },
    resolutionNote: { type: String, maxlength: 1000 },
  },
  { timestamps: true }
);

export const Dispute = mongoose.model('Dispute', disputeSchema);
