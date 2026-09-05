import { useState } from 'react';
import { StarRating } from './StarRating';
import { isValidRating } from '../utils/reviews';

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => Promise<void> | void;
  submitting?: boolean;
}

/** Form for a buyer to leave a rating + comment on a product they bought. */
export function ReviewForm({ onSubmit, submitting = false }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!isValidRating(rating)) {
      setError('Please pick a star rating.');
      return;
    }
    setError(null);
    await onSubmit(rating, comment.trim());
    setRating(0);
    setComment('');
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
      <StarRating rating={rating} onChange={setRating} size={24} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this product..."
        maxLength={500}
        rows={3}
        className="w-full resize-none rounded-md border border-gray-300 p-2 text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="self-start rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? 'Posting...' : 'Post review'}
      </button>
    </div>
  );
}
