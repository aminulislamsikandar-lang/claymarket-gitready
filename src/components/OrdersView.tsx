import React from 'react';
import { 
  Package, ArrowLeft, Store, Clock, CheckCircle2, 
  ChevronRight, MessageSquare, ShoppingBag 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OrdersView: React.FC = () => {
  const { orders, navigateTo, goBack, shops, startChatWithShop } = useApp();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready_for_pickup':
        return (
          <span className="px-3 py-1 bg-[#CBE4FF] text-[#1B5899] font-bold text-xs rounded-full flex items-center gap-1">
            <Store className="w-3.5 h-3.5" />
            Ready for Pickup
          </span>
        );
      case 'delivered':
      case 'completed':
        return (
          <span className="px-3 py-1 bg-[#CBEFD9] text-[#176F43] font-bold text-xs rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-3 py-1 bg-[#DDD4FF] text-[#553BB8] font-bold text-xs rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmed by Seller
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-[#FFE3D3] text-[#A03D12] font-bold text-xs rounded-full flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Pending Confirmation
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={goBack}
          className="p-2.5 rounded-full bg-white hover:bg-gray-100 text-[#20243A] shadow-xs border border-gray-200/80 transition-all cursor-pointer flex items-center gap-1 text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex items-center gap-2 text-sm text-[#737B89]">
          <span className="cursor-pointer hover:text-[#8067E8]" onClick={() => navigateTo('markets')}>Home</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-[#20243A]">My Orders</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#20243A]">
            My Orders
          </h1>
          <p className="text-xs sm:text-sm text-[#737B89]">
            Track your purchases and stall pickups from local shops
          </p>
        </div>
        <span className="text-xs font-bold bg-[#DDD4FF] text-[#553BB8] px-3.5 py-1.5 rounded-full">
          {orders.length} Total Orders
        </span>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const shop = shops.find(s => s.id === order.shopId) || shops[0];
          return (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-white/90 shadow-sm space-y-4"
              style={{
                boxShadow: '0 8px 24px -4px rgba(32, 36, 58, 0.04), inset 0 2px 3px rgba(255, 255, 255, 0.95)'
              }}
            >
              {/* Order Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-gray-400">Order #{order.id}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-500 font-medium">{order.createdAt || order.date}</span>
                  </div>
                  <h3 className="font-bold text-base text-[#20243A] mt-0.5">
                    {order.shopName}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2.5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img loading="lazy" decoding="async" 
                        src={item.product.images[0]} 
                        alt={item.product.name}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-gray-100" 
                      />
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-[#20243A]">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-[#737B89]">
                          Qty: {item.quantity} {item.selectedSize ? `• Size: ${item.selectedSize}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-[#20243A]">
                      ₹{(item.product.price ?? 0) * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Bottom Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  <span>Pickup location: </span>
                  <strong className="text-[#20243A]">{order.address || 'Not provided'}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-[#20243A] mr-2">
                    Total: ₹{order.totalAmount}
                  </span>
                  
                  <button
                    onClick={() => startChatWithShop(shop, undefined, `Hello! Inquiring regarding my order #${order.id}.`)}
                    className="px-4 py-2 bg-[#F1EDFD] hover:bg-[#8067E8] text-[#6C4DE6] hover:text-white rounded-full font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Contact Shop</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
