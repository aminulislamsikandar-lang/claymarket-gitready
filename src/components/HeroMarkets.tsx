import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, ArrowRight, Store, ShoppingBag, ArrowUpRight, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HeroClayIllustration } from './ClayIllustrations';
import { searchPlaces, PlaceSuggestion } from '../utils/geocoding';

export const HeroMarkets: React.FC = () => {
  const { 
    searchQuery, setSearchQuery, performSearch, navigateTo, 
    filteredMarkets, filteredShops, filteredProducts, markets, showToast
  } = useApp();

  const [localInput, setLocalInput] = useState(searchQuery);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const placesDebounceRef = useRef<number | null>(null);
  const placesRequestIdRef = useRef(0);

  // Sync external search query
  useEffect(() => {
    setLocalInput(searchQuery);
  }, [searchQuery]);

  // Real-world place/region autocomplete (debounced so we don't hammer the
  // free Nominatim service on every keystroke).
  useEffect(() => {
    if (placesDebounceRef.current) window.clearTimeout(placesDebounceRef.current);
    const query = localInput.trim();
    if (query.length < 3) {
      setPlaceSuggestions([]);
      setIsLoadingPlaces(false);
      return;
    }
    const requestId = ++placesRequestIdRef.current;
    setIsLoadingPlaces(true);
    placesDebounceRef.current = window.setTimeout(async () => {
      try {
        const results = await searchPlaces(query);
        if (placesRequestIdRef.current === requestId) setPlaceSuggestions(results);
      } catch {
        if (placesRequestIdRef.current === requestId) setPlaceSuggestions([]);
      } finally {
        if (placesRequestIdRef.current === requestId) setIsLoadingPlaces(false);
      }
    }, 500);
    return () => {
      if (placesDebounceRef.current) window.clearTimeout(placesDebounceRef.current);
    };
  }, [localInput]);

  // Click outside to dismiss search results
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(localInput);
    setIsDropdownOpen(false);
    if (localInput.trim()) {
      // If matches a market directly, can jump or show filtered view
    }
  };

  const handleNearMeClick = () => {
    if (markets.length === 0) {
      showToast('No markets are available yet. Please check back soon.', 'info');
      return;
    }
    // Select the closest featured market (e.g. Kachumara Market)
    const kachumara = markets.find(m => m.id === 'mkt_kachumara') || markets[0];
    navigateTo('market-detail', { market: kachumara });
  };

  const handleSelectPlace = (place: PlaceSuggestion) => {
    setLocalInput(place.label);
    setSearchQuery(place.label);
    setPlaceSuggestions([]);
  };

  const hasResults = localInput.trim().length > 0 && (filteredMarkets.length > 0 || filteredShops.length > 0 || filteredProducts.length > 0 || placeSuggestions.length > 0 || isLoadingPlaces);

  return (
    <section className="relative pt-3 pb-6 sm:pt-6 sm:pb-12 overflow-visible">
      {/* Background soft ambient glow (desktop only — flat, clean background on mobile) */}
      <div className="hidden sm:block absolute top-0 right-0 w-96 h-96 bg-[#DDD4FF]/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="hidden sm:block absolute top-20 left-10 w-72 h-72 bg-[#CBE4FF]/25 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-8 items-center">
        
        {/* LEFT COLUMN: Hero Text & Search */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-6">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-5xl lg:text-[54px] font-extrabold text-[#20243A] leading-[1.2] sm:leading-[1.12] tracking-tight">
              Explore Local Markets
            </h1>
            <p className="text-xs sm:text-lg text-[#737B89] font-medium leading-relaxed max-w-xl">
              Find and explore markets, shops and products in your area.
            </p>
          </div>

          {/* Search Input Box */}
          <div className="relative max-w-xl" ref={searchBoxRef}>
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <div className="relative w-full">
                <Search className="absolute left-3.5 sm:left-4.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                <input
                  id="hero-market-search-input"
                  type="text"
                  value={localInput}
                  onChange={(e) => {
                    setLocalInput(e.target.value);
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Search markets by name..."
                  className="w-full pl-10 sm:pl-12 pr-14 sm:pr-32 py-2.5 sm:py-4 bg-white rounded-lg sm:rounded-full text-[#20243A] placeholder:text-gray-400 font-medium text-sm sm:text-base border border-gray-200/90 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8067E8]/40 focus:border-[#8067E8] transition-all"
                  style={{
                    boxShadow: '0 6px 20px -2px rgba(32, 36, 58, 0.05), inset 0 2px 2px rgba(255, 255, 255, 0.9)'
                  }}
                />
              </div>

              {/* Purple Search Button (icon-only on mobile, text label from sm: up) */}
              <button
                type="submit"
                id="hero-search-submit-btn"
                aria-label="Search"
                className="absolute right-1.5 sm:right-2 p-2 sm:px-6 sm:py-2.5 bg-[#8067E8] hover:bg-[#6E52E2] active:scale-95 text-white font-bold text-sm rounded-md sm:rounded-full shadow-md transition-all cursor-pointer flex items-center justify-center"
                style={{
                  boxShadow: '0 4px 14px rgba(128, 103, 232, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
                }}
              >
                <Search className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>

            {/* Instant Search Autocomplete Results Dropdown */}
            {isDropdownOpen && hasResults && (
              <div className="absolute left-0 right-0 top-full mt-3 bg-white rounded-3xl p-4 shadow-2xl border border-gray-100 z-50 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2">

                {/* Real-world Place/Region Matches (OpenStreetMap) */}
                {(placeSuggestions.length > 0 || isLoadingPlaces) && (
                  <div className="mb-3 pb-2 border-b border-gray-100">
                    <span className="text-[11px] font-bold text-[#8067E8] uppercase tracking-wider px-3 block mb-1.5">
                      Places
                    </span>
                    {isLoadingPlaces && placeSuggestions.length === 0 ? (
                      <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Searching places...</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {placeSuggestions.map(place => (
                          <div
                            key={place.id}
                            onClick={() => handleSelectPlace(place)}
                            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#F7F5FE] cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-[#CBE4FF] text-[#1B5899] flex items-center justify-center shrink-0">
                                <MapPin className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[#20243A]">{place.label}</p>
                                {place.sublabel && <p className="text-xs text-[#737B89]">{place.sublabel}</p>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Markets Matches */}
                {filteredMarkets.length > 0 && (
                  <div className="mb-3">
                    <span className="text-[11px] font-bold text-[#8067E8] uppercase tracking-wider px-3 block mb-1.5">
                      Markets
                    </span>
                    <div className="space-y-1">
                      {filteredMarkets.slice(0, 3).map(m => (
                        <div
                          key={m.id}
                          onClick={() => {
                            navigateTo('market-detail', { market: m });
                            setIsDropdownOpen(false);
                          }}
                          className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#F7F5FE] cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#DDD4FF] text-[#6C4DE6] flex items-center justify-center">
                              <Store className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#20243A]">{m.name}</p>
                              <p className="text-xs text-[#737B89]">{m.location}</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shops Matches */}
                {filteredShops.length > 0 && (
                  <div className="mb-3 pt-2 border-t border-gray-100">
                    <span className="text-[11px] font-bold text-[#8067E8] uppercase tracking-wider px-3 block mb-1.5">
                      Shops
                    </span>
                    <div className="space-y-1">
                      {filteredShops.slice(0, 3).map(s => (
                        <div
                          key={s.id}
                          onClick={() => {
                            navigateTo('shop-detail', { shop: s });
                            setIsDropdownOpen(false);
                          }}
                          className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#F7F5FE] cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-xl object-cover" />
                            <div>
                              <p className="text-sm font-bold text-[#20243A]">{s.name}</p>
                              <p className="text-xs text-[#737B89]">{s.marketName} • {s.categoryName}</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products Matches */}
                {filteredProducts.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-[11px] font-bold text-[#8067E8] uppercase tracking-wider px-3 block mb-1.5">
                      Products
                    </span>
                    <div className="space-y-1">
                      {filteredProducts.slice(0, 3).map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            navigateTo('product-detail', { product: p });
                            setIsDropdownOpen(false);
                          }}
                          className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#F7F5FE] cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img src={p.images[0]} alt={p.name} className="w-8 h-8 rounded-xl object-cover" />
                            <div>
                              <p className="text-sm font-bold text-[#20243A]">{p.name}</p>
                              <p className="text-xs text-[#737B89]">₹{p.price} • {p.shopName}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#8067E8] bg-[#F1EDFD] px-2.5 py-1 rounded-full">
                            View
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Near Me Button (Optional pill matching reference) */}
          <div className="flex items-center gap-2 sm:gap-3 pt-0.5 sm:pt-1">
            <button
              id="hero-near-me-btn"
              onClick={handleNearMeClick}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-5 sm:py-2.5 bg-white hover:bg-[#FAF8FE] border border-gray-200/80 rounded-full text-xs sm:text-sm font-semibold text-[#20243A] shadow-xs hover:shadow-sm hover:border-[#DDD4FF] transition-all cursor-pointer group shrink-0"
              style={{
                boxShadow: '0 4px 12px rgba(0,0,0,0.03), inset 0 1px 2px #fff'
              }}
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#EDE7FD] text-[#8067E8] flex items-center justify-center group-hover:bg-[#8067E8] group-hover:text-white transition-colors">
                <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </div>
              <span>Near me</span>
            </button>
            <span className="text-[11px] sm:text-xs text-[#737B89] line-clamp-1">Explore markets near your current location</span>
          </div>

        </div>

        {/* RIGHT COLUMN: 3D Clay Illustration (desktop only — mobile stays flat and content-dense) */}
        <div className="hidden lg:flex lg:col-span-5 justify-center lg:justify-end">
          <div className="w-full max-w-[420px]">
            <HeroClayIllustration className="w-full h-auto" />
          </div>
        </div>

      </div>
    </section>
  );
};
