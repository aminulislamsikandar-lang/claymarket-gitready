// backend/src/utils/razorpaySignature.js
//
// Pure function, no network/DB — kept separate from the controller
// specifically so it's easy to unit-test (see the verification script in
// INSTRUCTIONS.md). This is the ONLY thing standing between a real payment
// and a forged "payment succeeded" request, so it must not be skipped.
import crypto from 'crypto';

/**
 * Verifies a Razorpay checkout callback's signature.
 * Razorpay signs `${orderId}|${paymentId}` with HMAC-SHA256 using your key
 * secret; the frontend sends that signature back, and we recompute it
 * server-side to make sure it wasn't tampered with.
 */
export function verifyRazorpaySignature({ orderId, paymentId, signature, keySecret }) {
  if (!orderId || !paymentId || !signature || !keySecret) return false;
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  // timingSafeEqual requires equal-length buffers, and throws otherwise —
  // guard the length first so a malformed signature can't crash the request.
  const expectedBuf = Buffer.from(expected, 'hex');
  const givenBuf = Buffer.from(signature, 'hex');
  if (expectedBuf.length !== givenBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, givenBuf);
}
