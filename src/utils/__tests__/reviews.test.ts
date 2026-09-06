import { describe, it, expect } from 'vitest';
import { computeAverageRating, ratingDistribution, isValidRating, formatReviewCount } from '../reviews';

const mk = (rating: number) => ({ rating });

describe('computeAverageRating', () => {
  it('returns 0 for no reviews', () => {
    expect(computeAverageRating([])).toBe(0);
  });

  it('averages and rounds to 1 decimal', () => {
    expect(computeAverageRating([mk(5), mk(4), mk(4)])).toBe(4.3);
  });

  it('handles a single review', () => {
    expect(computeAverageRating([mk(3)])).toBe(3);
  });
});

describe('ratingDistribution', () => {
  it('buckets each review under its rounded star', () => {
    const dist = ratingDistribution([mk(5), mk(5), mk(4), mk(1)]);
    expect(dist).toEqual({ 1: 1, 2: 0, 3: 0, 4: 1, 5: 2 });
  });

  it('clamps out-of-range ratings into 1-5', () => {
    const dist = ratingDistribution([mk(0), mk(6)]);
    expect(dist[1]).toBe(1);
    expect(dist[5]).toBe(1);
  });
});

describe('isValidRating', () => {
  it('accepts integers 1 through 5', () => {
    for (let i = 1; i <= 5; i++) expect(isValidRating(i)).toBe(true);
  });

  it('rejects 0, 6, and non-integers', () => {
    expect(isValidRating(0)).toBe(false);
    expect(isValidRating(6)).toBe(false);
    expect(isValidRating(3.5)).toBe(false);
  });
});

describe('formatReviewCount', () => {
  it('handles 0, 1, and plural counts', () => {
    expect(formatReviewCount(0)).toBe('No reviews yet');
    expect(formatReviewCount(1)).toBe('1 review');
    expect(formatReviewCount(5)).toBe('5 reviews');
  });
});
