/**
 * Loads Razorpay's checkout.js (once) and opens the payment modal.
 * Your backend does the actual order-creation and signature verification —
 * see backend/src/controllers/paymentController.js. This file only drives
 * the browser-side widget.
 */

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

function loadCheckoutScript(): Promise<void> {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = CHECKOUT_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script.'));
    document.body.appendChild(script);
  });
}

export interface RazorpayCheckoutOptions {
  keyId: string;
  amount: number; // in paise, as returned by /payments/create-order
  currency: string;
  razorpayOrderId: string;
  name: string; // e.g. buyer's name
  email?: string;
  contact?: string;
  onSuccess: (payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  onDismiss?: () => void;
}

/** Opens the Razorpay checkout modal. Call after your backend's /payments/create-order responds. */
export async function openRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<void> {
  await loadCheckoutScript();
  if (!window.Razorpay) throw new Error('Razorpay checkout script did not load correctly.');

  const rzp = new window.Razorpay({
    key: options.keyId,
    amount: options.amount,
    currency: options.currency,
    order_id: options.razorpayOrderId,
    name: 'Claymarket',
    prefill: { name: options.name, email: options.email, contact: options.contact },
    handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
      options.onSuccess(response);
    },
    modal: {
      ondismiss: () => options.onDismiss?.(),
    },
  });
  rzp.open();
}
