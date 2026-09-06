import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  /** Pass to make this an input control — called with the clicked star (1-5). Omit for read-only display. */
  onChange?: (rating: number) => void;
  size?: number;
}

/** Read-only star display when `onChange` is omitted; interactive star-picker when provided. */
export function StarRating({ rating, onChange, size = 18 }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];
  const interactive = typeof onChange === 'function';

  return (
    <div className="flex items-center gap-0.5" role={interactive ? 'radiogroup' : 'img'} aria-label={`${rating} out of 5 stars`}>
      {stars.map((star) => {
        const filled = star <= Math.round(rating);
        const Tag = interactive ? 'button' : 'span';
        return (
          <Tag
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => onChange(star) : undefined}
            aria-label={interactive ? `Rate ${star} star${star > 1 ? 's' : ''}` : undefined}
            className={interactive ? 'cursor-pointer' : undefined}
          >
            <Star size={size} fill={filled ? 'currentColor' : 'none'} className={filled ? 'text-yellow-500' : 'text-gray-300'} />
          </Tag>
        );
      })}
    </div>
  );
}
