/**
 * Order-tracking status helpers.
 *
 * Works with the exact status values your backend already sends
 * (see AppContext.tsx mapBackendOrder): 'pending' | 'confirmed' |
 * 'ready_for_pickup' | 'completed' | 'cancelled'. This file adds no new
 * statuses to the type — it only turns the existing ones into a
 * customer-facing timeline, like Amazon/Flipkart's order tracker.
 */

export type OrderStatus = 'pending' | 'confirmed' | 'ready_for_pickup' | 'completed' | 'cancelled';

export interface OrderStatusStep {
  status: OrderStatus;
  label: string;
  description: string;
}

/** The normal (non-cancelled) progression, in order. */
export const ORDER_STATUS_FLOW: OrderStatusStep[] = [
  { status: 'pending', label: 'Order placed', description: 'Waiting for the seller to confirm your order.' },
  { status: 'confirmed', label: 'Confirmed', description: 'The seller has accepted your order and is preparing it.' },
  { status: 'ready_for_pickup', label: 'Ready', description: 'Your order is ready for pickup or out for delivery.' },
  { status: 'completed', label: 'Completed', description: 'Order delivered / picked up. Enjoy!' },
];

/** Returns the step index (0-based) for a given status within ORDER_STATUS_FLOW, or -1 if not found (e.g. 'cancelled'). */
export function getStatusIndex(status: OrderStatus): number {
  return ORDER_STATUS_FLOW.findIndex((step) => step.status === status);
}

/** Whether `step` has already been reached given the order's `currentStatus` — used to fill in the timeline UI. */
export function isStepReached(step: OrderStatus, currentStatus: OrderStatus): boolean {
  if (currentStatus === 'cancelled') return step === 'pending';
  const stepIndex = getStatusIndex(step);
  const currentIndex = getStatusIndex(currentStatus);
  if (stepIndex === -1 || currentIndex === -1) return false;
  return stepIndex <= currentIndex;
}

/** Human label + short description for any status, including 'cancelled' (which isn't part of the linear flow). */
export function getStatusLabel(status: OrderStatus): { label: string; description: string } {
  if (status === 'cancelled') {
    return { label: 'Cancelled', description: 'This order was cancelled.' };
  }
  const step = ORDER_STATUS_FLOW.find((s) => s.status === status);
  return step ? { label: step.label, description: step.description } : { label: status, description: '' };
}
