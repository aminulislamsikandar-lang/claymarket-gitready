import React from 'react';
import { CheckCircle2, ShoppingBag, XCircle } from 'lucide-react';
import { Shop } from '../types';

interface ShopOnlineOrderStatusProps {
  shop: Shop;
}

export const ShopOnlineOrderStatus: React.FC<ShopOnlineOrderStatusProps> = ({ shop }) => {
  const isAvailable = shop.onlineOrdering !== false;

  return (
    <div
      role="status"
      aria-label={isAvailable ? 'Online orders available' : 'Online orders unavailable'}
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm transition-all ${
        isAvailable
          ? 'border-[#A7E2BE] bg-[#F0FBF5] text-[#176F43]'
          : 'border-[#F1C0C0] bg-[#FFF7F7] text-[#A33A3A]'
      }`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isAvailable ? 'bg-[#CBEFD9]' : 'bg-[#F9DADA]'}`}>
        {isAvailable ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm font-extrabold">
          <ShoppingBag className="h-4 w-4" />
          {isAvailable ? 'Accepting Online Orders' : 'Online Orders Unavailable'}
        </div>
        <p className="mt-0.5 text-xs opacity-80">
          {isAvailable
            ? 'Customers can place orders directly from this shop.'
            : 'This shop is not accepting new online orders right now.'}
        </p>
      </div>
    </div>
  );
};
