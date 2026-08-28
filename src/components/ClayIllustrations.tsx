import React from 'react';

// 3D Clay Category Icon Component
export const CategoryClayIcon: React.FC<{ type: string; className?: string }> = ({ type, className = "w-12 h-12" }) => {
  switch (type) {
    case 'slippers':
      return (
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="slipperGrad1" x1="20" y1="15" x2="45" y2="65" gradientUnits="userSpaceOnUse">
              <stop stopColor="#967EFF" />
              <stop offset="1" stopColor="#6C4CE8" />
            </linearGradient>
            <linearGradient id="slipperGrad2" x1="40" y1="20" x2="65" y2="70" gradientUnits="userSpaceOnUse">
              <stop stopColor="#876DEF" />
              <stop offset="1" stopColor="#5835DB" />
            </linearGradient>
            <linearGradient id="strapGrad" x1="25" y1="30" x2="40" y2="45" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFA07A" />
              <stop offset="1" stopColor="#FF7A59" />
            </linearGradient>
            <filter id="clayShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#402396" floodOpacity="0.25" />
            </filter>
          </defs>
          {/* Left Slipper */}
          <g filter="url(#clayShadow)" transform="rotate(-15 32 45)">
            <rect x="20" y="20" width="22" height="42" rx="11" fill="url(#slipperGrad1)" />
            {/* Sole highlight */}
            <path d="M22 28C22 24 26 22 31 22C36 22 40 24 40 28V36C40 38 36 40 31 40C26 40 22 38 22 36V28Z" fill="#B3A2FF" fillOpacity="0.5" />
            {/* Strap */}
            <path d="M20 36C20 28 42 28 42 36C42 41 20 41 20 36Z" fill="url(#strapGrad)" />
            <circle cx="31" cy="34" r="3" fill="#FFE5DC" />
          </g>
          {/* Right Slipper */}
          <g filter="url(#clayShadow)" transform="rotate(8 50 45)">
            <rect x="40" y="22" width="22" height="42" rx="11" fill="url(#slipperGrad2)" />
            <path d="M42 30C42 26 46 24 51 24C56 24 60 26 60 30V38C60 40 56 42 51 42C46 42 42 40 42 38V30Z" fill="#C7BAFF" fillOpacity="0.5" />
            <path d="M40 38C40 30 62 30 62 38C62 43 40 43 40 38Z" fill="url(#strapGrad)" />
            <circle cx="51" cy="36" r="3" fill="#FFE5DC" />
          </g>
        </svg>
      );

    case 'clothes':
      return (
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="tshirtGrad" x1="20" y1="20" x2="60" y2="65" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#F5ECE5" />
            </linearGradient>
            <linearGradient id="collarGrad" x1="30" y1="18" x2="50" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF9671" />
              <stop offset="1" stopColor="#FF6F43" />
            </linearGradient>
            <filter id="shirtShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#BA4E26" floodOpacity="0.2" />
            </filter>
          </defs>
          <g filter="url(#shirtShadow)">
            {/* T-Shirt Body */}
            <path d="M28 22L16 30C14.5 31 14 33 15 35L19 41C20 42.5 22 43 23.5 42L28 39V60C28 62.2 29.8 64 32 64H48C50.2 64 52 62.2 52 60V39L56.5 42C58 43 60 42.5 61 41L65 35C66 33 65.5 31 64 30L52 22H28Z" fill="url(#tshirtGrad)" stroke="#FFE8DE" strokeWidth="1.5" />
            {/* Orange Collar Accent */}
            <path d="M32 22C32 28 48 28 48 22C44 25 36 25 32 22Z" fill="url(#collarGrad)" />
            {/* Sleeve hems */}
            <path d="M15.5 36L19 41" stroke="#FF8A65" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M64.5 36L61 41" stroke="#FF8A65" strokeWidth="2.5" strokeLinecap="round" />
            {/* Bottom Hem */}
            <path d="M30 60H50" stroke="#FFD8CB" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      );

    case 'electronics':
      return (
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="phoneCase" x1="26" y1="16" x2="54" y2="64" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38E1B7" />
              <stop offset="1" stopColor="#0CA678" />
            </linearGradient>
            <linearGradient id="phoneScreen" x1="30" y1="20" x2="50" y2="60" gradientUnits="userSpaceOnUse">
              <stop stopColor="#212529" />
              <stop offset="1" stopColor="#0B0C10" />
            </linearGradient>
            <filter id="phoneShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#087F5B" floodOpacity="0.25" />
            </filter>
          </defs>
          <g filter="url(#phoneShadow)">
            {/* Phone Case */}
            <rect x="25" y="16" width="30" height="48" rx="8" fill="url(#phoneCase)" />
            {/* Screen */}
            <rect x="28" y="20" width="24" height="40" rx="5" fill="url(#phoneScreen)" />
            {/* Notch / Speaker */}
            <rect x="36" y="22" width="8" height="2" rx="1" fill="#495057" />
            {/* Screen reflection highlight */}
            <path d="M29 22L46 54H41L29 31V22Z" fill="#FFFFFF" fillOpacity="0.12" />
            {/* Home indicator */}
            <rect x="37" y="56" width="6" height="1.5" rx="0.75" fill="#ADB5BD" />
          </g>
        </svg>
      );

    case 'home':
      return (
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="chairGrad" x1="24" y1="20" x2="56" y2="60" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFA94D" />
              <stop offset="1" stopColor="#E8590C" />
            </linearGradient>
            <linearGradient id="cushionGrad" x1="28" y1="36" x2="52" y2="52" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFD43B" />
              <stop offset="1" stopColor="#F59F00" />
            </linearGradient>
            <filter id="chairShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#D9480F" floodOpacity="0.25" />
            </filter>
          </defs>
          <g filter="url(#chairShadow)">
            {/* Chair Legs */}
            <path d="M26 54L22 64" stroke="#495057" strokeWidth="3" strokeLinecap="round" />
            <path d="M54 54L58 64" stroke="#495057" strokeWidth="3" strokeLinecap="round" />
            <path d="M32 54L30 63" stroke="#868E96" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M48 54L50 63" stroke="#868E96" strokeWidth="2.5" strokeLinecap="round" />
            {/* Backrest */}
            <rect x="25" y="20" width="30" height="26" rx="8" fill="url(#chairGrad)" />
            {/* Armrests */}
            <rect x="20" y="32" width="10" height="18" rx="5" fill="url(#chairGrad)" />
            <rect x="50" y="32" width="10" height="18" rx="5" fill="url(#chairGrad)" />
            {/* Seat Cushion */}
            <rect x="26" y="38" width="28" height="15" rx="6" fill="url(#cushionGrad)" />
          </g>
        </svg>
      );

    case 'grocery':
      return (
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="bagGrad" x1="25" y1="32" x2="55" y2="64" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F08C00" />
              <stop offset="1" stopColor="#D9480F" />
            </linearGradient>
            <filter id="bagShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#9C36B5" floodOpacity="0.2" />
            </filter>
          </defs>
          <g filter="url(#bagShadow)">
            {/* Celery / Greens */}
            <circle cx="34" cy="26" r="6" fill="#40C057" />
            <circle cx="44" cy="24" r="7" fill="#2F9E44" />
            {/* Carrot */}
            <path d="M46 18L54 28L48 30Z" fill="#FF922B" />
            <path d="M54 16L51 20" stroke="#37B24D" strokeWidth="2" strokeLinecap="round" />
            {/* Bread Baguette */}
            <rect x="36" y="16" width="8" height="20" rx="4" transform="rotate(-20 36 16)" fill="#FAB005" />
            {/* Paper Bag */}
            <path d="M24 32H56L53 62C52.8 63.5 51.5 64.5 50 64.5H30C28.5 64.5 27.2 63.5 27 62L24 32Z" fill="url(#bagGrad)" />
            {/* Bag Fold Marks */}
            <path d="M30 38V58" stroke="#FFE8CC" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
            <path d="M50 38V58" stroke="#FFE8CC" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
          </g>
        </svg>
      );

    case 'more':
    default:
      return (
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="26" cy="40" r="5.5" fill="#8067E8" />
          <circle cx="40" cy="40" r="5.5" fill="#8067E8" />
          <circle cx="54" cy="40" r="5.5" fill="#8067E8" />
        </svg>
      );
  }
};

// 3D Clay Hero Storefront Graphic
export const HeroClayIllustration: React.FC<{ className?: string }> = ({ className = "w-full max-w-md h-auto" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Background Soft Pastel Silhouette City Skyline & Clouds */}
      <svg viewBox="0 0 480 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-sm">
        <defs>
          <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#F5F0FF" />
            <stop offset="1" stopColor="#E9DFFF" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="shopRoof" x1="160" y1="80" x2="320" y2="140" gradientUnits="userSpaceOnUse">
            <stop stopColor="#DDD4FF" />
            <stop offset="0.5" stopColor="#8067E8" />
            <stop offset="1" stopColor="#553BB8" />
          </linearGradient>
          <linearGradient id="shopWall" x1="180" y1="140" x2="300" y2="240" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF9F5" />
            <stop offset="1" stopColor="#F5EFEA" />
          </linearGradient>
          <linearGradient id="pinGrad" x1="230" y1="35" x2="250" y2="75" gradientUnits="userSpaceOnUse">
            <stop stopColor="#967EFF" />
            <stop offset="1" stopColor="#5B38D6" />
          </linearGradient>
          <linearGradient id="bagOrange" x1="130" y1="210" x2="165" y2="255" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF9E79" />
            <stop offset="1" stopColor="#F76707" />
          </linearGradient>
          <linearGradient id="bagPurple" x1="320" y1="215" x2="360" y2="255" gradientUnits="userSpaceOnUse">
            <stop stopColor="#B197FC" />
            <stop offset="1" stopColor="#7048E8" />
          </linearGradient>
          <filter id="softClayDrop" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#20243A" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Soft Background Silhouette Elements */}
        <g opacity="0.35">
          <rect x="50" y="100" width="35" height="120" rx="6" fill="#DDD4FF" />
          <rect x="95" y="70" width="45" height="150" rx="8" fill="#CBE4FF" />
          <rect x="340" y="80" width="40" height="140" rx="6" fill="#DDD4FF" />
          <rect x="390" y="110" width="35" height="110" rx="6" fill="#CBEFD9" />
          {/* Subtle clouds */}
          <ellipse cx="120" cy="50" rx="35" ry="14" fill="url(#cloudGrad)" />
          <ellipse cx="360" cy="40" rx="40" ry="16" fill="url(#cloudGrad)" />
        </g>

        {/* Platform / Island Floor */}
        <ellipse cx="240" cy="245" rx="170" ry="40" fill="#E6EEF8" />
        <ellipse cx="240" cy="240" rx="155" ry="34" fill="#F0F6FC" />
        <ellipse cx="240" cy="235" rx="140" ry="28" fill="#FFFFFF" />

        {/* Left Tree */}
        <g filter="url(#softClayDrop)">
          <rect x="100" y="170" width="8" height="40" rx="4" fill="#C084FC" />
          <circle cx="104" cy="165" r="22" fill="#69DB7C" />
          <circle cx="104" cy="155" r="16" fill="#8CE99A" />
        </g>

        {/* Right Tree */}
        <g filter="url(#softClayDrop)">
          <rect x="375" y="175" width="8" height="35" rx="4" fill="#C084FC" />
          <circle cx="379" cy="170" r="20" fill="#69DB7C" />
          <circle cx="379" cy="162" r="14" fill="#8CE99A" />
        </g>

        {/* Shop Building (Main) */}
        <g filter="url(#softClayDrop)">
          {/* Main Wall */}
          <rect x="170" y="130" width="140" height="100" rx="14" fill="url(#shopWall)" stroke="#EDE5DF" strokeWidth="1.5" />
          
          {/* Door */}
          <rect x="225" y="165" width="30" height="65" rx="6" fill="#845EF7" />
          <circle cx="232" cy="198" r="2.5" fill="#FFE066" />
          <rect x="230" y="172" width="20" height="18" rx="3" fill="#B197FC" fillOpacity="0.7" />

          {/* Left Window */}
          <rect x="182" y="165" width="32" height="32" rx="6" fill="#FFE066" />
          <path d="M198 165V197M182 181H214" stroke="#FFF9DB" strokeWidth="2" strokeLinecap="round" />
          
          {/* Right Window */}
          <rect x="266" y="165" width="32" height="32" rx="6" fill="#FFE066" />
          <path d="M282 165V197M266 181H298" stroke="#FFF9DB" strokeWidth="2" strokeLinecap="round" />

          {/* Awning Stripes (Purple & Cream) */}
          <g>
            <path d="M155 125C155 120 160 115 168 115H312C320 115 325 120 325 125L330 145C330 152 322 156 314 156C306 156 300 150 297 145C294 150 288 156 280 156C272 156 266 150 263 145C260 150 254 156 246 156C238 156 232 150 229 145C226 150 220 156 212 156C204 156 198 150 195 145C192 150 186 156 178 156C170 156 162 152 162 145L155 125Z" fill="#8067E8" />
            <path d="M168 115H188L195 145C198 150 192 156 186 156C178 156 170 152 168 145L168 115Z" fill="#DDD4FF" />
            <path d="M216 115H236L242 145C245 150 239 156 233 156C225 156 217 152 216 145L216 115Z" fill="#DDD4FF" />
            <path d="M264 115H284L290 145C293 150 287 156 281 156C273 156 265 152 264 145L264 115Z" fill="#DDD4FF" />
          </g>

          {/* Roof Ridge */}
          <rect x="162" y="112" width="156" height="6" rx="3" fill="#5F3DC4" />
        </g>

        {/* Location Pin Hovering */}
        <g filter="url(#softClayDrop)" transform="translate(0, -5)">
          <path d="M240 38C228 38 218 48 218 60C218 75 240 96 240 96C240 96 262 75 262 60C262 48 252 38 240 38Z" fill="url(#pinGrad)" />
          <circle cx="240" cy="58" r="8" fill="#FFFFFF" />
          <circle cx="240" cy="58" r="4" fill="#8067E8" />
        </g>

        {/* Shopping Bags & Basket Foreground */}
        {/* Left Orange Shopping Bag */}
        <g filter="url(#softClayDrop)">
          <path d="M135 205C135 198 141 195 147 195C153 195 159 198 159 205" stroke="#D9480F" strokeWidth="3" fill="none" />
          <rect x="130" y="205" width="34" height="40" rx="8" fill="url(#bagOrange)" />
          <path d="M147 215V235" stroke="#FFE8CC" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Right Purple Shopping Bag */}
        <g filter="url(#softClayDrop)">
          <path d="M332 210C332 204 337 200 342 200C347 200 352 204 352 210" stroke="#5F3DC4" strokeWidth="2.5" fill="none" />
          <rect x="325" y="210" width="28" height="34" rx="7" fill="url(#bagPurple)" />
          <circle cx="339" cy="225" r="4" fill="#E5DBFF" />
        </g>

        {/* Purple Market Basket */}
        <g filter="url(#softClayDrop)">
          <rect x="358" y="218" width="32" height="24" rx="6" fill="#7048E8" />
          <path d="M358 222H390" stroke="#B197FC" strokeWidth="2" />
          <path d="M366 218V242M374 218V242M382 218V242" stroke="#B197FC" strokeWidth="1.5" />
          {/* Basket Handle */}
          <path d="M364 218C364 210 384 210 384 218" stroke="#5F3DC4" strokeWidth="3" fill="none" />
        </g>
      </svg>
    </div>
  );
};
