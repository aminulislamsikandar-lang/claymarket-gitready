/**
 * Static return/refund policy page. Content is a starting point — have it
 * reviewed for your actual seller-payout and refund-timing terms before
 * treating it as a binding legal policy.
 */
export function ReturnPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 text-sm leading-relaxed text-gray-700">
      <h1 className="mb-4 text-2xl font-semibold text-gray-900">Returns, Refunds &amp; Disputes</h1>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-medium text-gray-900">Raising a problem</h2>
        <p>
          If something's wrong with an order — item not received, damaged, or not as described —
          you can report it from your Orders page within <strong>7 days</strong> of the order being
          marked completed. The seller is notified immediately and has 3 days to respond.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-medium text-gray-900">How disputes are resolved</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>The seller can respond directly and offer a refund, replacement, or explanation.</li>
          <li>If you and the seller can't agree, Claymarket support will review the case and the chat history for that order.</li>
          <li>Approved refunds are returned to your original payment method within 5-7 business days.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-medium text-gray-900">What's not covered</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Change-of-mind returns on perishable or made-to-order items, unless the seller's shop policy says otherwise.</li>
          <li>Disputes raised more than 7 days after order completion.</li>
        </ul>
      </section>

      <p className="text-xs text-gray-400">
        This page is a starting template — replace it with your actual policy wording before publishing.
      </p>
    </div>
  );
}
