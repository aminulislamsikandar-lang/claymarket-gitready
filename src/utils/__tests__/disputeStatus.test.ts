import { describe, it, expect, vi, afterEach } from 'vitest';
import { getDisputeReasonLabel, getDisputeStatusLabel, isDisputeResolved, isWithinDisputeWindow } from '../disputeStatus';

describe('getDisputeReasonLabel / getDisputeStatusLabel', () => {
  it('returns a human label for every known reason', () => {
    expect(getDisputeReasonLabel('item_not_received')).toBe('Item not received');
    expect(getDisputeReasonLabel('other')).toBe('Other');
  });

  it('returns a human label for every known status', () => {
    expect(getDisputeStatusLabel('open')).toBe('Awaiting seller response');
    expect(getDisputeStatusLabel('resolved_refund')).toBe('Resolved — refunded');
  });
});

describe('isDisputeResolved', () => {
  it('is false for open/seller_responded', () => {
    expect(isDisputeResolved('open')).toBe(false);
    expect(isDisputeResolved('seller_responded')).toBe(false);
  });

  it('is true for all resolved/closed terminal states', () => {
    expect(isDisputeResolved('resolved_refund')).toBe(true);
    expect(isDisputeResolved('resolved_replacement')).toBe(true);
    expect(isDisputeResolved('resolved_denied')).toBe(true);
    expect(isDisputeResolved('closed')).toBe(true);
  });
});

describe('isWithinDisputeWindow', () => {
  afterEach(() => vi.useRealTimers());

  it('is true just under the window, false just over it', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T00:00:00Z'));
    expect(isWithinDisputeWindow('2026-01-05T00:00:00Z', 7)).toBe(true); // 5 days ago
    expect(isWithinDisputeWindow('2026-01-01T00:00:00Z', 7)).toBe(false); // 9 days ago
  });
});
