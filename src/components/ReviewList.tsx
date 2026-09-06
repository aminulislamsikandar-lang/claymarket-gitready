import { StarRating } from './StarRating';
import { computeAverageRating, ratingDistribution, formatReviewCount, type Review } from '../utils/reviews';

interface ReviewListProps {
  reviews: Review[];
}

/** Product-page reviews section: average + breakdown bar + individual reviews. */
export function ReviewList({ reviews }: ReviewListProps) {
  const average = computeAverageRating(reviews);
  const distribution = ratingDistribution(reviews);
  const total = reviews.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-semibold">{average || '—'}</span>
        <div>
          <StarRating rating={average} />
          <p className="text-sm text-gray-500">{formatReviewCount(total)}</p>
        </div>
      </div>

      {total > 0 && (
        <div className="flex flex-col gap-1">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = distribution[star];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-8">{star}★</span>
                <div className="h-2 flex-1 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-yellow-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-col divide-y divide-gray-100">
        {reviews.map((review) => (
          <div key={review.id} className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{review.userName}</span>
              <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
            <StarRating rating={review.rating} size={14} />
            {review.comment && <p className="mt-1 text-sm text-gray-700">{review.comment}</p>}
          </div>
        ))}
        {total === 0 && <p className="py-3 text-sm text-gray-400">Be the first to review this product.</p>}
      </div>
    </div>
  );
}
