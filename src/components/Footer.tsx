import React from 'react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { navigateTo, setAuthModalTab, setIsAuthModalOpen, showToast } = useApp();

  return (
    <footer className="bg-[#15192C] text-white pt-14 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-6 pb-12 border-b border-gray-800/80">
          
          {/* Brand Col (2 cols wide on desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              onClick={() => navigateTo('markets')} 
              className="flex items-center gap-3 cursor-pointer select-none group inline-flex"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#8067E8] text-white flex items-center justify-center shadow-lg font-bold text-xl">
                C
              </div>
              <div>
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  claymarket
                </span>
                <p className="text-[11px] text-gray-400 font-medium -mt-1">
                  Your local marketplace
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Find markets, explore shops and buy from trusted local sellers.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <button 
                type="button"
                
                aria-label="Facebook"
                onClick={(e) => { e.preventDefault(); showToast("Social profile link will be available soon.", "info"); }}
                className="w-9 h-9 rounded-full bg-[#202742] hover:bg-[#8067E8] text-gray-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                </svg>
              </button>

              <button 
                type="button"
                
                aria-label="Instagram"
                onClick={(e) => { e.preventDefault(); showToast("Social profile link will be available soon.", "info"); }}
                className="w-9 h-9 rounded-full bg-[#202742] hover:bg-[#8067E8] text-gray-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </button>

              <button 
                type="button"
                
                aria-label="YouTube"
                onClick={(e) => { e.preventDefault(); showToast("Social profile link will be available soon.", "info"); }}
                className="w-9 h-9 rounded-full bg-[#202742] hover:bg-[#8067E8] text-gray-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </button>

              <button 
                type="button"
                
                aria-label="Twitter / X"
                onClick={(e) => { e.preventDefault(); showToast("Social profile link will be available soon.", "info"); }}
                className="w-9 h-9 rounded-full bg-[#202742] hover:bg-[#8067E8] text-gray-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Col 1: Explore */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-mono">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <button onClick={() => navigateTo('markets')} className="hover:text-white transition-colors">
                  Markets
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shops')} className="hover:text-white transition-colors">
                  Shops
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('categories')} className="hover:text-white transition-colors">
                  Categories
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('about')} className="hover:text-white transition-colors">
                  About Us
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2: My Account */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-mono">
              My Account
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <button onClick={() => navigateTo('orders')} className="hover:text-white transition-colors">
                  My Orders
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('wishlist')} className="hover:text-white transition-colors">
                  Wishlist
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('messages')} className="hover:text-white transition-colors">
                  Messages
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('profile')} className="hover:text-white transition-colors">
                  My Profile
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-mono">
              Support
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <button onClick={() => navigateTo('help')} className="hover:text-white transition-colors">
                  Help Center
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('faq')} className="hover:text-white transition-colors">
                  FAQ
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('help')} className="hover:text-white transition-colors">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('terms')} className="hover:text-white transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('privacy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: For Sellers & Download */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-mono">
              For Sellers
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400 mb-6">
              <li>
                <button 
                  onClick={() => {
                    setAuthModalTab('become-seller');
                    setIsAuthModalOpen(true);
                  }} 
                  className="hover:text-white text-[#DDD4FF] font-semibold transition-colors"
                >
                  Sell on Claymarket
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('help')} className="hover:text-white transition-colors">
                  Seller Guide
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('seller-dashboard')} className="hover:text-white transition-colors">
                  Shop Management
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('help')} className="hover:text-white transition-colors">
                  Resources
                </button>
              </li>
            </ul>

            {/* Download App Badges */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-300">Download Our App</p>
              
              {/* Google Play Pill */}
              <div className="flex items-center gap-2.5 px-3 py-2 bg-[#202742] hover:bg-[#283254] rounded-xl border border-gray-700/60 cursor-pointer transition-colors">
                <svg className="w-5 h-5 fill-current text-[#34A853]" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186c-.352-.364-.567-.887-.567-1.468V3.282c0-.58.215-1.104.566-1.468zM15.207 13.414l2.428 2.428-11.83 6.779 9.402-9.207zm2.428-5.242l-2.428 2.428-9.402-9.207 11.83 6.779zm1.328 1.455l3.14 1.8c.88.504.88 1.332 0 1.836l-3.14 1.8-2.043-2.043 2.043-1.993z" />
                </svg>
                <div className="text-left">
                  <span className="text-[9px] text-gray-400 uppercase tracking-wider block leading-none">GET IT ON</span>
                  <span className="text-xs font-bold text-white leading-tight">Google Play</span>
                </div>
              </div>

              {/* App Store Pill */}
              <div className="flex items-center gap-2.5 px-3 py-2 bg-[#202742] hover:bg-[#283254] rounded-xl border border-gray-700/60 cursor-pointer transition-colors">
                <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.56.64-1.06 1.7-0.93 2.73 1.02.08 2.05-.48 2.66-1.23z" />
                </svg>
                <div className="text-left">
                  <span className="text-[9px] text-gray-400 uppercase tracking-wider block leading-none">Download on the</span>
                  <span className="text-xs font-bold text-white leading-tight">App Store</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2024 Claymarket. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => navigateTo('privacy')} className="hover:text-gray-400 transition-colors">Privacy</button>
            <button onClick={() => navigateTo('terms')} className="hover:text-gray-400 transition-colors">Terms</button>
            <button onClick={() => navigateTo('help')} className="hover:text-gray-400 transition-colors">Security</button>
            <button onClick={() => navigateTo('help')} className="hover:text-gray-400 transition-colors">Sitemap</button>
          </div>
        </div>

      </div>
    </footer>
  );
};
