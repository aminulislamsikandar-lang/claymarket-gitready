import React from 'react';
import { CheckCircle2, ShoppingBag, XCircle, ChevronRight } from 'lucide-react';
import { Shop } from '../types';

interface ShopOnlineOrderStatusProps {
  shop: Shop;
}

export const ShopOnlineOrderStatus: React.FC<ShopOnlineOrderStatusProps> = ({ shop }) => {
  const isAvailable = shop.onlineOrdering !== false;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={isAvailable ? 'Online orders available' : 'Online orders unavailable'}
      className={`group relative overflow-hidden rounded-2xl border px-4 py-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        isAvailable
          ? 'border-[#A7E2BE] bg-gradient-to-r from-[#F0FBF5] to-white text-[#176F43]'
          : 'border-[#F1C0C0] bg-gradient-to-r from-[#FFF7F7] to-white text-[#A33A3A]'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isAvailable ? 'bg-[#CBEFD9]' : 'bg-[#F9DADA]'}`}>
          {isAvailable ? <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> : <XCircle className="h-5 w-5" aria-hidden="true" />}
          <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${isAvailable ? 'bg-[#2FB66D] animate-pulse' : 'bg-[#D9534F]'}`} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-extrabold">
            <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{isAvailable ? 'Accepting Online Orders' : 'Online Orders Unavailable'}</span>
          </div>
          <p className="mt-0.5 text-xs leading-5 opacity-80">
            {isAvailable
              ? 'Customers can place orders directly from this shop.'
              : 'This shop is not accepting new online orders right now.'}
          </p>
        </div>
        <ChevronRight className="hidden h-4 w-4 shrink-0 opacity-40 sm:block" aria-hidden="true" />
      </div>
    </div>
  );
};
