import { Check, X } from 'lucide-react';
import { ORDER_STATUS_FLOW, isStepReached, getStatusLabel, type OrderStatus } from '../utils/orderStatus';

interface OrderStatusTimelineProps {
  status: OrderStatus;
}

/**
 * Amazon/Flipkart-style order tracker. Renders the 4-step flow with the
 * current/passed steps filled in, or a single "Cancelled" state.
 */
export function OrderStatusTimeline({ status }: OrderStatusTimelineProps) {
  if (status === 'cancelled') {
    const { label, description } = getStatusLabel('cancelled');
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
          <X size={18} />
        </span>
        <div>
          <p className="font-medium text-red-700">{label}</p>
          <p className="text-sm text-red-600">{description}</p>
        </div>
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-0">
      {ORDER_STATUS_FLOW.map((step, index) => {
        const reached = isStepReached(step.status, status);
        const isLast = index === ORDER_STATUS_FLOW.length - 1;
        return (
          <li key={step.status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${
                  reached ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                {reached ? <Check size={18} /> : <span className="text-xs">{index + 1}</span>}
              </span>
              {!isLast && <span className={`w-0.5 flex-1 ${reached ? 'bg-green-600' : 'bg-gray-300'}`} style={{ minHeight: 24 }} />}
            </div>
            <div className="pb-6">
              <p className={`font-medium ${reached ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
              <p className={`text-sm ${reached ? 'text-gray-600' : 'text-gray-400'}`}>{step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
