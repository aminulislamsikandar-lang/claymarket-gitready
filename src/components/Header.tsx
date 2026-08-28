import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, Bell, Heart, ChevronDown, User as UserIcon, 
  Menu, X, Search, Store, ShoppingBag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AccountDropdown } from './AccountDropdown';
import { NavigationTab } from '../types';

export const Header: React.FC = () => {
  const { 
    currentUser, activeNavTab, navigateTo, wishlist, conversations,
    setIsMessagesOpen, setIsCartOpen, cart,
    searchQuery, setSearchQuery, filteredMarkets, filteredShops, filteredProducts
  } = useApp();

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const totalUnreadMessages = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Close search and notif on outside click
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchActive(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  const handleNavClick = (tab: NavigationTab) => {
    if (tab === 'markets') navigateTo('markets');
    else if (tab === 'shops') navigateTo('shops');
    else if (tab === 'categories') navigateTo('categories');
    else if (tab === 'about') navigateTo('about');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F7F5F3]/95 backdrop-blur-md border-b border-gray-200/60 transition-all">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LEFT: Logo & Tagline */}
          <div 
            id="brand-logo-btn"
            onClick={() => navigateTo('markets')} 
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            {/* Claymorphic Purple Logo Icon */}
            <div className="w-11 h-11 rounded-2xl bg-[#8067E8] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform"
              style={{
                boxShadow: '0 6px 16px rgba(128, 103, 232, 0.4), inset 0 2px 2px rgba(255, 255, 255, 0.4)'
              }}
            >
              <span className="font-extrabold text-2xl font-sans tracking-tight">C</span>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-[#20243A] tracking-tight group-hover:text-[#8067E8] transition-colors">
                claymarket
              </span>
              <p className="text-[11px] text-[#737B89] font-medium -mt-1 tracking-normal">
                Your local marketplace
              </p>
            </div>
          </div>

          {/* CENTER: Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3 bg-white/70 px-4 py-1.5 rounded-full border border-white/80 shadow-sm">
            {(['markets', 'shops', 'categories', 'about'] as NavigationTab[]).map((tab) => {
              const label = tab === 'about' ? 'About Us' : tab.charAt(0).toUpperCase() + tab.slice(1);
              const isActive = activeNavTab === tab;
              return (
                <button
                  key={tab}
                  id={`nav-tab-${tab}`}
                  onClick={() => handleNavClick(tab)}
                  className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                    isActive 
                      ? 'text-[#8067E8] bg-[#F1EDFD] shadow-xs' 
                      : 'text-[#505767] hover:text-[#20243A] hover:bg-gray-100/60'
                  }`}
                >
                  {label}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-[#8067E8] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT: Action Icons & Account State Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Messages Icon Button */}
            <button
              id="header-messages-btn"
              onClick={() => setIsMessagesOpen(true)}
              aria-label="Messages"
              className="relative p-2.5 rounded-full bg-white hover:bg-gray-50 text-[#20243A] border border-gray-200/70 shadow-xs hover:shadow-sm transition-all"
              style={{
                boxShadow: '0 2px 6px rgba(0,0,0,0.03), inset 0 1px 1px #fff'
              }}
            >
              <MessageSquare className="w-5 h-5 text-[#374151]" />
              {totalUnreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#8067E8] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#F7F5F3] shadow-xs">
                  {totalUnreadMessages}
                </span>
              )}
            </button>

            {/* Notifications Bell */}
            <div className="relative" ref={notifRef}>
              <button
                id="header-notifications-btn"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                aria-label="Notifications"
                className="relative p-2.5 rounded-full bg-white hover:bg-gray-50 text-[#20243A] border border-gray-200/70 shadow-xs hover:shadow-sm transition-all"
                style={{
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03), inset 0 1px 1px #fff'
                }}
              >
                <Bell className="w-5 h-5 text-[#374151]" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#FF6B6B] rounded-full ring-2 ring-white" />
              </button>

              {/* Notifications Dropdown Popover */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl p-4 shadow-2xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                    <h4 className="font-bold text-sm text-[#20243A]">Notifications</h4>
                    <span className="text-[11px] bg-[#DDD4FF] text-[#553BB8] font-bold px-2 py-0.5 rounded-full">
                      2 New
                    </span>
                  </div>
                  <div className="py-2 space-y-2">
                    <div className="p-2.5 bg-[#FAF8FE] rounded-2xl border border-[#EDE7FD] flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-xl bg-[#DDD4FF] text-[#8067E8] flex items-center justify-center shrink-0">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#20243A]">Aminul Slipper Shop</p>
                        <p className="text-[11px] text-[#737B89]">Fresh new arrival: Waterproof Monsoon Clogs available now!</p>
                        <span className="text-[10px] text-gray-400 mt-1 block">15 mins ago</span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-gray-50 rounded-2xl flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-xl bg-[#CBEFD9] text-[#176F43] flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#20243A]">Kachumara Market Day</p>
                        <p className="text-[11px] text-[#737B89]">Weekly Haat is active today with over 60+ verified stalls.</p>
                        <span className="text-[10px] text-gray-400 mt-1 block">2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Heart */}
            <button
              id="header-wishlist-btn"
              onClick={() => navigateTo('wishlist')}
              aria-label="Wishlist"
              className="relative p-2.5 rounded-full bg-white hover:bg-gray-50 text-[#20243A] border border-gray-200/70 shadow-xs hover:shadow-sm transition-all"
              style={{
                boxShadow: '0 2px 6px rgba(0,0,0,0.03), inset 0 1px 1px #fff'
              }}
            >
              <Heart className="w-5 h-5 text-[#374151]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF6B8B] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#F7F5F3]">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button with Count */}
            {totalCartCount > 0 && (
              <button
                id="header-cart-btn"
                onClick={() => setIsCartOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#8067E8] text-white font-bold text-xs shadow-md hover:bg-[#6E52E2] transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{totalCartCount}</span>
              </button>
            )}

            {/* ACCOUNT PILL TRIGGER (Guest / Buyer / Seller) */}
            <div className="relative">
              <button
                id="account-dropdown-trigger"
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-white hover:bg-gray-50 rounded-full border border-gray-200/80 shadow-xs transition-all cursor-pointer"
                style={{
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03), inset 0 1px 2px #fff'
                }}
              >
                {currentUser.role === 'guest' ? (
                  <>
                    <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-[#20243A]">Guest</span>
                  </>
                ) : (
                  <>
                    <img loading="lazy" decoding="async" 
                      src={currentUser.avatar} 
                      alt={currentUser.name} 
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-[#DDD4FF]" 
                    />
                    <span className="text-sm font-semibold text-[#20243A] max-w-[90px] truncate">
                      {currentUser.name.split(' ')[0]}
                    </span>
                  </>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isAccountOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Account Dropdown Component */}
              <AccountDropdown 
                isOpen={isAccountOpen} 
                onClose={() => setIsAccountOpen(false)} 
              />
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-full bg-white border border-gray-200 text-[#20243A]"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-6 py-4 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            {(['markets', 'shops', 'categories', 'about'] as NavigationTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleNavClick(tab)}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  activeNavTab === tab ? 'bg-[#F1EDFD] text-[#8067E8]' : 'text-[#20243A] hover:bg-gray-50'
                }`}
              >
                {tab === 'about' ? 'About Us' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-[#737B89] font-medium">
              Role: <strong className="text-[#8067E8]">{currentUser.role}</strong>
            </span>
            <button
              onClick={() => {
                setIsAccountOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="text-xs text-[#8067E8] font-bold underline"
            >
              Account Options
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
