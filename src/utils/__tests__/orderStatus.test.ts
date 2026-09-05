import { describe, it, expect } from 'vitest';
import { getStatusIndex, isStepReached, getStatusLabel, ORDER_STATUS_FLOW } from '../orderStatus';

describe('getStatusIndex', () => {
  it('returns the correct position for each real status', () => {
    expect(getStatusIndex('pending')).toBe(0);
    expect(getStatusIndex('confirmed')).toBe(1);
    expect(getStatusIndex('ready_for_pickup')).toBe(2);
    expect(getStatusIndex('completed')).toBe(3);
  });
});

describe('isStepReached', () => {
  it('marks earlier and current steps as reached', () => {
    expect(isStepReached('pending', 'ready_for_pickup')).toBe(true);
    expect(isStepReached('confirmed', 'ready_for_pickup')).toBe(true);
    expect(isStepReached('ready_for_pickup', 'ready_for_pickup')).toBe(true);
  });

  it('marks later steps as not reached', () => {
    expect(isStepReached('completed', 'pending')).toBe(false);
    expect(isStepReached('ready_for_pickup', 'confirmed')).toBe(false);
  });

  it('a cancelled order only shows "pending" as reached', () => {
    expect(isStepReached('pending', 'cancelled')).toBe(true);
    expect(isStepReached('confirmed', 'cancelled')).toBe(false);
    expect(isStepReached('completed', 'cancelled')).toBe(false);
  });
});

describe('getStatusLabel', () => {
  it('returns a label for cancelled outside the linear flow', () => {
    expect(getStatusLabel('cancelled').label).toBe('Cancelled');
  });

  it('returns matching labels for every step in the flow', () => {
    for (const step of ORDER_STATUS_FLOW) {
      expect(getStatusLabel(step.status).label).toBe(step.label);
    }
  });
});
