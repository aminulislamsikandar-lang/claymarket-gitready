/** Pure helpers for the reviews/ratings system — no Firestore/network calls here. */

export interface Review {
  id: string;
  productId: string;
  shopId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string; // ISO date
}

/** Rounds to 1 decimal, e.g. 4.666 -> 4.7. Returns 0 for an empty list. */
export function computeAverageRating(reviews: Pick<Review, 'rating'>[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((total, r) => total + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

/** Buckets counts per star (1-5) — used for the "4★ x12, 3★ x4 ..." breakdown bar. */
export function ratingDistribution(reviews: Pick<Review, 'rating'>[]): Record<1 | 2 | 3 | 4 | 5, number> {
  const dist: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    dist[star] += 1;
  }
  return dist;
}

/** True if `rating` is a valid 1-5 integer star value a form should accept. */
export function isValidRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

/** Formats a count for display: 0 -> "No reviews yet", 1 -> "1 review", n -> "n reviews". */
export function formatReviewCount(count: number): string {
  if (count === 0) return 'No reviews yet';
  return count === 1 ? '1 review' : `${count} reviews`;
}
