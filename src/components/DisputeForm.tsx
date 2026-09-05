import { useState } from 'react';
import type { DisputeReason } from '../utils/disputeStatus';

interface DisputeFormProps {
  onSubmit: (reason: DisputeReason, description: string) => Promise<void> | void;
  submitting?: boolean;
}

const REASON_OPTIONS: { value: DisputeReason; label: string }[] = [
  { value: 'item_not_received', label: 'Item not received' },
  { value: 'item_damaged', label: 'Item arrived damaged' },
  { value: 'item_not_as_described', label: 'Item not as described' },
  { value: 'wrong_item', label: 'Received the wrong item' },
  { value: 'other', label: 'Other' },
];

/** "Report a problem" form on an order — files a dispute for the seller/admin to respond to. */
export function DisputeForm({ onSubmit, submitting = false }: DisputeFormProps) {
  const [reason, setReason] = useState<DisputeReason>('item_not_received');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (description.trim().length < 10) {
      setError('Please describe the issue in a bit more detail (10+ characters).');
      return;
    }
    setError(null);
    await onSubmit(reason, description.trim());
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
      <label className="text-sm font-medium">What went wrong?</label>
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value as DisputeReason)}
        className="rounded-md border border-gray-300 p-2 text-sm"
      >
        {REASON_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the issue..."
        maxLength={1000}
        rows={4}
        className="w-full resize-none rounded-md border border-gray-300 p-2 text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="self-start rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Report a problem'}
      </button>
      <p className="text-xs text-gray-400">You can raise this within 7 days of your order being completed.</p>
    </div>
  );
}
