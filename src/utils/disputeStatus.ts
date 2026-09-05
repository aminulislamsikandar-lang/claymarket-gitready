/** Pure label/badge helpers for dispute status — matches backend/src/models/Dispute.js enum. */

export type DisputeStatus = 'open' | 'seller_responded' | 'resolved_refund' | 'resolved_replacement' | 'resolved_denied' | 'closed';
export type DisputeReason = 'item_not_received' | 'item_damaged' | 'item_not_as_described' | 'wrong_item' | 'other';

const REASON_LABELS: Record<DisputeReason, string> = {
  item_not_received: 'Item not received',
  item_damaged: 'Item arrived damaged',
  item_not_as_described: 'Item not as described',
  wrong_item: 'Received the wrong item',
  other: 'Other',
};

const STATUS_LABELS: Record<DisputeStatus, string> = {
  open: 'Awaiting seller response',
  seller_responded: 'Seller responded',
  resolved_refund: 'Resolved — refunded',
  resolved_replacement: 'Resolved — replacement sent',
  resolved_denied: 'Resolved — claim denied',
  closed: 'Closed',
};

export function getDisputeReasonLabel(reason: DisputeReason): string {
  return REASON_LABELS[reason] ?? reason;
}

export function getDisputeStatusLabel(status: DisputeStatus): string {
  return STATUS_LABELS[status] ?? status;
}

/** True once a dispute has reached any terminal state. */
export function isDisputeResolved(status: DisputeStatus): boolean {
  return status === 'resolved_refund' || status === 'resolved_replacement' || status === 'resolved_denied' || status === 'closed';
}

/** Whether it's still within the window to raise a new dispute for an order completed at `completedAt`. */
export function isWithinDisputeWindow(completedAt: string | Date, windowDays = 7): boolean {
  const completedMs = new Date(completedAt).getTime();
  const daysSince = (Date.now() - completedMs) / (1000 * 60 * 60 * 24);
  return daysSince <= windowDays;
}
