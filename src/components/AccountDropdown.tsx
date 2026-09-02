import React, { useRef, useEffect } from 'react';
import { 
  User as UserIcon, Package, Heart, MessageSquare, MapPin, 
  Bell, Store, LayoutDashboard, Settings, HelpCircle, 
  LogOut, ChevronRight, Sparkles, LogIn, UserPlus, Info, 
  Layers, ShoppingBag, ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AccountDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountDropdown: React.FC<AccountDropdownProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, logoutUser, navigateTo, 
    setIsAuthModalOpen, setAuthModalTab, wishlist, conversations,
    setIsMessagesOpen, shops, showToast
  } = useApp();

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalUnreadMessages = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  // GUEST DROPDOWN (Image 3)
  if (currentUser.role === 'guest') {
    return (
      <div 
        ref={dropdownRef}
        className="absolute right-0 top-full mt-3 w-76 bg-white rounded-3xl p-4 shadow-2xl border border-white/90 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        style={{
          boxShadow: '0 20px 40px -10px rgba(32, 36, 58, 0.16), 0 0 1px 1px rgba(0,0,0,0.04)',
        }}
      >
        {/* Top Header Card */}
        <div className="flex items-center gap-3.5 pb-3 border-b border-gray-100/80">
          <div className="w-12 h-12 rounded-full bg-[#EAE5FE] text-[#8067E8] flex items-center justify-center font-bold text-lg shadow-inner">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-[#20243A] text-base leading-tight">Guest User</h4>
            <p className="text-xs text-[#737B89] mt-0.5">Welcome to Claymarket</p>
          </div>
        </div>

        <p className="text-xs text-[#737B89] pt-3 pb-2 font-medium">
          Sign in to unlock the best experience
        </p>

        {/* Auth Actions */}
        <div className="space-y-1.5 pb-3 border-b border-gray-100">
          <button
            id="dropdown-sign-in-btn"
            onClick={() => {
              onClose();
              setAuthModalTab('login');
              setIsAuthModalOpen(true);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-[#F4F1FE] text-[#20243A] font-semibold text-sm transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#F0ECFC] text-[#8067E8] flex items-center justify-center group-hover:bg-[#8067E8] group-hover:text-white transition-colors">
              <LogIn className="w-4 h-4" />
            </div>
            <span>Sign In</span>
          </button>

          <button
            id="dropdown-create-account-btn"
            onClick={() => {
              onClose();
              setAuthModalTab('register');
              setIsAuthModalOpen(true);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-[#F4F1FE] text-[#20243A] font-semibold text-sm transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#F0ECFC] text-[#8067E8] flex items-center justify-center group-hover:bg-[#8067E8] group-hover:text-white transition-colors">
              <UserPlus className="w-4 h-4" />
            </div>
            <span>Create Account</span>
          </button>
        </div>

        {/* Guest Browse Links */}
        <div className="py-2 space-y-1 border-b border-gray-100">
          <button
            onClick={() => {
              onClose();
              navigateTo('markets');
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 text-[#20243A] text-sm font-medium transition-colors text-left"
          >
            <Store className="w-4 h-4 text-[#737B89]" />
            <span>Browse Markets</span>
          </button>

          <button
            onClick={() => {
              onClose();
              navigateTo('shops');
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 text-[#20243A] text-sm font-medium transition-colors text-left"
          >
            <ShoppingBag className="w-4 h-4 text-[#737B89]" />
            <span>Browse Shops</span>
          </button>

          <button
            onClick={() => {
              onClose();
              navigateTo('categories');
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 text-[#20243A] text-sm font-medium transition-colors text-left"
          >
            <Layers className="w-4 h-4 text-[#737B89]" />
            <span>Browse Categories</span>
          </button>
        </div>

        {/* Support & About */}
        <div className="pt-2 space-y-1">
          <button
            onClick={() => {
              onClose();
              navigateTo('help');
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 text-[#737B89] text-sm font-medium transition-colors text-left"
          >
            <HelpCircle className="w-4 h-4 text-[#737B89]" />
            <span>Help & Support</span>
          </button>

          <button
            onClick={() => {
              onClose();
              navigateTo('about');
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 text-[#737B89] text-sm font-medium transition-colors text-left"
          >
            <Info className="w-4 h-4 text-[#737B89]" />
            <span>About Us</span>
          </button>
        </div>


      </div>
    );
  }

  // LOGGED-IN (BUYER ONLY / SELLER + BUYER) (Image 2)
  const isSeller = currentUser.role === 'seller';
  const isAdmin = currentUser.role === 'admin';

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-3 w-80 bg-white rounded-3xl p-4 shadow-2xl border border-white/90 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
      style={{
        boxShadow: '0 24px 48px -12px rgba(32, 36, 58, 0.18), 0 0 1px 1px rgba(0,0,0,0.04)',
      }}
    >
      {/* User Header Profile Card */}
      <div 
        onClick={() => {
          onClose();
          navigateTo('profile');
        }}
        className="flex items-center justify-between p-2 rounded-2xl hover:bg-[#FAF8FE] cursor-pointer transition-colors group mb-1"
      >
        <div className="flex items-center gap-3">
          <img loading="lazy" decoding="async" 
            src={currentUser.avatar} 
            alt={currentUser.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-[#DDD4FF] shadow-sm"
          />
          <div>
            <h4 className="font-bold text-[#20243A] text-base leading-tight group-hover:text-[#8067E8] transition-colors">
              {currentUser.name}
            </h4>
            <p className="text-xs text-[#737B89] font-medium mt-0.5">
              {isAdmin ? 'Admin' : isSeller ? 'Seller • Buyer' : 'Buyer'}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#8067E8] group-hover:translate-x-0.5 transition-all" />
      </div>

      {/* Main Buyer Navigation Links */}
      <div className="py-2 space-y-0.5 border-t border-gray-100">
        <button
          onClick={() => {
            onClose();
            navigateTo('profile');
          }}
          className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl hover:bg-gray-50 text-[#20243A] text-sm font-medium transition-colors text-left"
        >
          <UserIcon className="w-4 h-4 text-[#737B89]" />
          <span>My Profile</span>
        </button>

        <button
          onClick={() => {
            onClose();
            navigateTo('orders');
          }}
          className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl hover:bg-gray-50 text-[#20243A] text-sm font-medium transition-colors text-left"
        >
          <Package className="w-4 h-4 text-[#737B89]" />
          <span>My Orders</span>
        </button>

        <button
          onClick={() => {
            onClose();
            navigateTo('wishlist');
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 text-[#20243A] text-sm font-medium transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <Heart className="w-4 h-4 text-[#737B89]" />
            <span>Wishlist</span>
          </div>
          {wishlist.length > 0 && (
            <span className="text-xs bg-[#DDD4FF] text-[#553BB8] font-bold px-2 py-0.5 rounded-full">
              {wishlist.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            onClose();
            setIsMessagesOpen(true);
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 text-[#20243A] text-sm font-medium transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <MessageSquare className="w-4 h-4 text-[#737B89]" />
            <span>Messages</span>
          </div>
          {totalUnreadMessages > 0 && (
            <span className="text-xs bg-[#8067E8] text-white font-bold px-2 py-0.5 rounded-full">
              {totalUnreadMessages}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            onClose();
            navigateTo('saved-addresses');
          }}
          className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl hover:bg-gray-50 text-[#20243A] text-sm font-medium transition-colors text-left"
        >
          <MapPin className="w-4 h-4 text-[#737B89]" />
          <span>Saved Addresses</span>
        </button>

        <button
          onClick={() => {
            onClose();
            navigateTo('notifications');
          }}
          className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl hover:bg-gray-50 text-[#20243A] text-sm font-medium transition-colors text-left"
        >
          <Bell className="w-4 h-4 text-[#737B89]" />
          <span>Notifications</span>
        </button>
      </div>

      {/* ADMIN-ONLY SECTION */}
      {isAdmin && (
        <div className="py-2.5 border-t border-gray-100">
          <button
            id="dropdown-admin-panel-btn"
            onClick={() => {
              onClose();
              navigateTo('admin-dashboard');
            }}
            className="w-full flex items-start gap-3.5 p-2.5 rounded-2xl bg-[#FEF3E8] hover:bg-[#FCE8D4] transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#F5C88A] text-[#8A5A1E] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#20243A]">Admin Panel</p>
              <p className="text-xs text-[#8A5A1E] font-semibold">Manage markets</p>
            </div>
          </button>
        </div>
      )}

      {/* SELLER SPECIFIC SECTION OR BECOME A SELLER CARD */}
      <div className="py-2.5 border-t border-gray-100">
        {isSeller ? (
          // Seller Account Options (Aminul)
          <div className="space-y-1">
            <button
    id="dropdown-my-shop-btn"
    onClick={() => {
      onClose();
      const myShop = shops.find((shop) => shop.id === currentUser.shopId);
      if (!myShop) {
        showToast('Your shop is still loading. Please try again.', 'info');
        return;
      }
      navigateTo('shop-detail', { shop: myShop });
    }}
    className="w-full flex items-start gap-3.5 p-2.5 rounded-2xl bg-[#FAF8FE] hover:bg-[#F3EEFE] transition-colors text-left group"
  >
    <div className="w-8 h-8 rounded-xl bg-[#DDD4FF] text-[#6C4DE6] flex items-center justify-center shrink-0 mt-0.5">
      <Store className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-[#20243A]">My Shop</p>
      <p className="text-xs text-[#8067E8] font-semibold truncate">
        {currentUser.shopName || 'My Shop'}
      </p>
    </div>
  </button>

            <button
              id="dropdown-seller-dashboard-btn"
              onClick={() => {
                onClose();
                navigateTo('seller-dashboard');
              }}
              className="w-full flex items-start gap-3.5 p-2.5 rounded-2xl hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-[#CBE4FF] text-[#1B5899] flex items-center justify-center shrink-0 mt-0.5">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#20243A]">Seller Dashboard</p>
                <p className="text-xs text-[#737B89]">Manage your shop & sales</p>
              </div>
            </button>
          </div>
        ) : (
          // Buyer Only -> "Become a Seller" Card (Rahul)
          <button
            id="dropdown-become-seller-btn"
            onClick={() => {
              onClose();
              setAuthModalTab('become-seller');
              setIsAuthModalOpen(true);
            }}
            className="w-full flex items-start gap-3.5 p-3 rounded-2xl bg-[#F6F2FE] hover:bg-[#ECE5FD] border border-[#DDD4FF] transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#8067E8] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#6C4DE6] flex items-center gap-1.5">
                <span>Become a Seller</span>
                <Sparkles className="w-3.5 h-3.5 text-[#8067E8]" />
              </p>
              <p className="text-xs text-[#737B89] mt-0.5">
                Open your shop and start selling
              </p>
            </div>
          </button>
        )}
      </div>

      {/* Settings, Support, Logout */}
      <div className="pt-2 border-t border-gray-100 space-y-0.5">
        <button
          onClick={() => {
            onClose();
            navigateTo('settings');
          }}
          className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl hover:bg-gray-50 text-[#737B89] text-sm font-medium transition-colors text-left"
        >
          <Settings className="w-4 h-4 text-[#737B89]" />
          <span>Settings</span>
        </button>

        <button
          onClick={() => {
            onClose();
            navigateTo('help');
          }}
          className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl hover:bg-gray-50 text-[#737B89] text-sm font-medium transition-colors text-left"
        >
          <HelpCircle className="w-4 h-4 text-[#737B89]" />
          <span>Help & Support</span>
        </button>

        <button
          id="dropdown-logout-btn"
          onClick={() => {
            onClose();
            logoutUser();
          }}
          className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 text-sm font-semibold transition-colors text-left mt-1"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span>Logout</span>
        </button>
      </div>

    </div>
  );
};
