import React from 'react';
import { ShieldCheck, MessageSquare, Users, Lock } from 'lucide-react';

export const AboutUsSection: React.FC = () => {
  return (
    <section className="py-4 sm:py-8">
      <div 
        className="relative rounded-xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 border border-white/95 shadow-sm overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #FAF7FD 0%, #F5F1FD 45%, #EBE6FC 100%)',
          boxShadow: '0 16px 36px -10px rgba(128, 103, 232, 0.08), inset 0 2px 4px rgba(255, 255, 255, 0.95)'
        }}
      >
        {/* Soft background glow circles (desktop only — flat/clean on mobile) */}
        <div className="hidden sm:block absolute -top-10 -right-10 w-48 h-48 bg-[#DDD4FF]/50 rounded-full blur-2xl pointer-events-none" />
        <div className="hidden sm:block absolute -bottom-10 -left-10 w-48 h-48 bg-[#CBE4FF]/40 rounded-full blur-2xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-center">
          
          {/* Left Graphic: Claymarket Community Illustration (desktop only) */}
          <div className="hidden lg:flex lg:col-span-4 justify-center">
            <div className="relative w-full max-w-[280px]">
              <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-sm">
                <defs>
                  <linearGradient id="aboutShopRoof" x1="50" y1="40" x2="230" y2="80" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#967EFF" />
                    <stop offset="1" stopColor="#6C4CE8" />
                  </linearGradient>
                  <linearGradient id="aboutAwningStripe" x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#DDD4FF" />
                    <stop offset="1" stopColor="#C7BAFF" />
                  </linearGradient>
                </defs>
                {/* Ground */}
                <ellipse cx="140" cy="180" rx="120" ry="18" fill="#E2DCF7" />
                <ellipse cx="140" cy="177" rx="105" ry="14" fill="#FFFFFF" />
                
                {/* Small Shop Building */}
                <rect x="70" y="80" width="140" height="90" rx="12" fill="#FFFFFF" stroke="#ECE4FD" strokeWidth="2" />
                <rect x="115" y="115" width="50" height="55" rx="6" fill="#8067E8" />
                <rect x="125" y="125" width="30" height="20" rx="4" fill="#CBE4FF" />
                <circle cx="122" cy="145" r="2.5" fill="#FFE066" />
                
                {/* Awning */}
                <path d="M60 75H220L226 95C226 102 218 106 210 106C202 106 196 100 193 95C190 100 184 106 176 106C168 106 162 100 159 95C156 100 150 106 142 106C134 106 128 100 125 95C122 100 116 106 108 106C100 106 94 100 91 95C88 100 82 106 74 106C66 106 58 102 60 95L60 75Z" fill="url(#aboutShopRoof)" />
                <path d="M74 75H94L91 95C88 100 82 106 74 106C66 106 58 102 60 95L60 75Z" fill="url(#aboutAwningStripe)" />
                <path d="M125 75H145L142 95C139 100 133 106 125 106C117 106 111 100 108 95L108 75Z" fill="url(#aboutAwningStripe)" />
                <path d="M176 75H196L193 95C190 100 184 106 176 106C168 106 162 100 159 95L159 75Z" fill="url(#aboutAwningStripe)" />

                {/* Left Shopper Avatar */}
                <circle cx="45" cy="120" r="14" fill="#FFD9C7" />
                <path d="M45 108C40 108 35 112 35 118C38 116 48 116 55 120C55 113 50 108 45 108Z" fill="#374151" />
                <rect x="33" y="136" width="24" height="36" rx="8" fill="#8067E8" />
                <circle cx="45" cy="174" r="5" fill="#4B5563" />

                {/* Right Seller Avatar */}
                <circle cx="235" cy="118" r="14" fill="#FFD9C7" />
                <path d="M235 106C229 106 224 110 224 116C228 114 240 114 246 118C246 111 241 106 235 106Z" fill="#1F2937" />
                <rect x="223" y="134" width="24" height="38" rx="8" fill="#40C057" />
                <circle cx="235" cy="174" r="5" fill="#4B5563" />

                {/* Small floating hearts & stars */}
                <circle cx="140" cy="45" r="4" fill="#FF8787" />
                <circle cx="100" cy="55" r="3" fill="#FFE066" />
                <circle cx="180" cy="50" r="3" fill="#69DB7C" />
              </svg>
            </div>
          </div>

          {/* Right Info: Heading, Description & 4 Pillars */}
          <div className="lg:col-span-8 space-y-2.5 sm:space-y-5">
            <div>
              <h3 className="text-base sm:text-3xl font-extrabold text-[#20243A] tracking-tight mb-1 sm:mb-2">
                About Us
              </h3>
              <p className="text-xs sm:text-base text-[#505767] font-medium leading-relaxed max-w-3xl">
                Claymarket is your trusted local marketplace to discover the best markets, shops and products in your area. We connect local sellers with local buyers and support small businesses to grow digitally.
              </p>
            </div>

            {/* 4 Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3.5 pt-1 sm:pt-2">
              
              {/* Feature 1 */}
              <div className="flex items-center gap-2 sm:gap-3.5 p-2 sm:p-3 rounded-lg sm:rounded-2xl bg-white/80 border border-white shadow-xs backdrop-blur-xs">
                <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#DDD4FF] text-[#553BB8] flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] sm:text-sm font-bold text-[#20243A] leading-tight">Local & Trusted</h4>
                  <p className="text-[9px] leading-tight sm:text-xs text-[#737B89] line-clamp-2 sm:line-clamp-none">Verified markets and shops in your area.</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-2 sm:gap-3.5 p-2 sm:p-3 rounded-lg sm:rounded-2xl bg-white/80 border border-white shadow-xs backdrop-blur-xs">
                <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#CBE4FF] text-[#1B5899] flex items-center justify-center shrink-0 shadow-xs">
                  <MessageSquare className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] sm:text-sm font-bold text-[#20243A] leading-tight">Easy to Connect</h4>
                  <p className="text-[9px] leading-tight sm:text-xs text-[#737B89] line-clamp-2 sm:line-clamp-none">Chat with sellers and get what you need.</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-2 sm:gap-3.5 p-2 sm:p-3 rounded-lg sm:rounded-2xl bg-white/80 border border-white shadow-xs backdrop-blur-xs">
                <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#CBEFD9] text-[#176F43] flex items-center justify-center shrink-0 shadow-xs">
                  <Users className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] sm:text-sm font-bold text-[#20243A] leading-tight">Support Local</h4>
                  <p className="text-[9px] leading-tight sm:text-xs text-[#737B89] line-clamp-2 sm:line-clamp-none">We help local businesses grow digitally.</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-center gap-2 sm:gap-3.5 p-2 sm:p-3 rounded-lg sm:rounded-2xl bg-white/80 border border-white shadow-xs backdrop-blur-xs">
                <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#FFD9C7] text-[#A03D12] flex items-center justify-center shrink-0 shadow-xs">
                  <Lock className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] sm:text-sm font-bold text-[#20243A] leading-tight">Safe & Secure</h4>
                  <p className="text-[9px] leading-tight sm:text-xs text-[#737B89] line-clamp-2 sm:line-clamp-none">Your data and payments are always protected.</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
