// backend/src/controllers/paymentController.js
//
// Requires env vars: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
// Requires npm package: razorpay (added to package.json dependencies)
import Razorpay from 'razorpay';
import { Order } from '../models/Order.js';
import { verifyRazorpaySignature } from '../utils/razorpaySignature.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/** Step 1: buyer clicks "Pay now" — create a Razorpay order tied to our order's amount. */
export const createRazorpayOrder = async (req, res) => {
  const buyerId = req.user?.id;
  if (!buyerId) return res.status(401).json({ error: 'Login required.' });

  const { orderId } = req.body;
  const order = await Order.findOne({ _id: orderId, buyerId });
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  if (order.paymentStatus === 'paid') return res.status(400).json({ error: 'This order is already paid.' });

  try {
    const rpOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100), // paise
      currency: 'INR',
      receipt: String(order._id),
      notes: { orderId: String(order._id), buyerId: String(buyerId) },
    });
    order.razorpayOrderId = rpOrder.id;
    await order.save();
    return res.json({ razorpayOrderId: rpOrder.id, amount: rpOrder.amount, currency: rpOrder.currency, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    return res.status(502).json({ error: 'Could not create payment order.', detail: err.message });
  }
};

/** Step 2: after checkout, the frontend posts Razorpay's callback fields here — verify before trusting "paid". */
export const verifyPayment = async (req, res) => {
  const buyerId = req.user?.id;
  if (!buyerId) return res.status(401).json({ error: 'Login required.' });

  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const order = await Order.findOne({ _id: orderId, buyerId });
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  if (order.razorpayOrderId !== razorpay_order_id) {
    return res.status(400).json({ error: 'Order/payment mismatch.' });
  }

  const valid = verifyRazorpaySignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  });
  if (!valid) return res.status(400).json({ error: 'Payment verification failed.' });

  order.paymentStatus = 'paid';
  order.razorpayPaymentId = razorpay_payment_id;
  await order.save();
  return res.json({ success: true, order });
};
