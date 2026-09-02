import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ChevronDown, Eye, EyeOff, Loader2, MapPin, Search, Store, X } from 'lucide-react';
import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useApp } from '../context/AppContext';
import { firebaseAuthClient, firebaseDb } from '../firebase';
import { searchPlaces, type PlaceSuggestion } from '../utils/geocoding';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen, setIsAuthModalOpen, authModalTab,
    setAuthModalTab, loginUser, registerAccount, registerSeller,
    markets, categories, currentUser,
  } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [selectedMarketId, setSelectedMarketId] = useState('mkt_kachumara');
  const [marketName, setMarketName] = useState('');
  const [selectedMarketPlace, setSelectedMarketPlace] = useState<PlaceSuggestion | null>(null);
  const [marketSuggestions, setMarketSuggestions] = useState<PlaceSuggestion[]>([]);
  const [marketSuggestionsOpen, setMarketSuggestionsOpen] = useState(false);
  const [marketLoading, setMarketLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('cat_slippers');
  const [stateName, setStateName] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const marketRef = useRef<HTMLDivElement>(null);
  const marketRequestRef = useRef(0);

  useEffect(() => {
    if (isAuthModalOpen && authModalTab === 'become-seller' && currentUser.role !== 'guest') {
      setOwnerName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setMarketName(currentUser.sellerLocation?.marketName || '');
      setSelectedMarketId(currentUser.sellerLocation?.marketId || 'mkt_kachumara');
    }
    if (!isAuthModalOpen) {
      setLoading(false); setError(''); setPassword(''); setPasswordVisible(false); setMarketSuggestionsOpen(false);
      return;
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) setIsAuthModalOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isAuthModalOpen, authModalTab, currentUser, loading, setIsAuthModalOpen]);

  useEffect(() => {
    const query = marketName.trim();
    if (query.length < 3) { setMarketSuggestions([]); setMarketLoading(false); return; }
    const requestId = ++marketRequestRef.current;
    setMarketLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const results = await searchPlaces(query);
        if (marketRequestRef.current === requestId) setMarketSuggestions(results);
      } catch {
        if (marketRequestRef.current === requestId) setMarketSuggestions([]);
      } finally {
        if (marketRequestRef.current === requestId) setMarketLoading(false);
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [marketName]);

  useEffect(() => {
    const outside = (event: MouseEvent) => {
      if (marketRef.current && !marketRef.current.contains(event.target as Node)) setMarketSuggestionsOpen(false);
    };
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, []);

  if (!isAuthModalOpen) return null;
  const resetStatus = () => setError('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); resetStatus(); setLoading(true);
    try { await loginUser(email.trim(), password); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); resetStatus(); setLoading(true);
    try { await registerAccount({ name: fullName.trim(), email: email.trim(), password, phone: phone.trim() }); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to create your account. Please try again.'); }
    finally { setLoading(false); }
  };

  const saveCustomMarketSeller = async () => {
    const firebaseUser = firebaseAuthClient?.currentUser;
    if (!firebaseUser || !firebaseDb) throw new Error('Please sign in before opening a shop.');
    const cleanName = ownerName.trim();
    const cleanShop = shopName.trim();
    const cleanMarket = marketName.trim();
    const cleanState = stateName.trim();
    const cleanDistrict = districtName.trim();
    const cleanAddress = address.trim();
    const category = categories.find(c => c.id === selectedCategoryId);
    if (!cleanName) throw new Error('Please enter your name.');
    if (!cleanShop) throw new Error('Please enter a shop name.');
    if (!cleanMarket) throw new Error('Please enter or select a market.');
    if (!cleanState) throw new Error('Please enter your state.');
    if (!cleanDistrict) throw new Error('Please enter your district.');
    if (!category) throw new Error('Please select a valid category.');

    const slug = cleanMarket.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'local';
    const customMarketId = `custom_market_${slug}`;
    const shopId = `shop_${firebaseUser.uid}`;
    const shopSlug = cleanShop.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'local-shop';

    if (firebaseUser.displayName !== cleanName) await updateProfile(firebaseUser, { displayName: cleanName });

    const shopDoc: Record<string, unknown> = {
      ownerId: firebaseUser.uid, ownerName: cleanName, name: cleanShop,
      slug: `${shopSlug}-${Date.now()}`, marketId: customMarketId, marketName: cleanMarket,
      state: cleanState, district: cleanDistrict, categoryIds: [category.id], categoryId: category.id,
      categoryName: category.name,
      profileImage: '',
      coverImage: '',
      description: '', phone: phone.trim(), address: cleanAddress,
      rating: 0, reviewsCount: 0, verified: false, followersCount: 0,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    };
    if (selectedMarketPlace) {
      shopDoc.marketLatitude = selectedMarketPlace.lat;
      shopDoc.marketLongitude = selectedMarketPlace.lon;
      shopDoc.marketPlaceLabel = selectedMarketPlace.label;
      shopDoc.marketPlaceSublabel = selectedMarketPlace.sublabel;
    }

    const batch = writeBatch(firebaseDb);
    batch.set(doc(firebaseDb, 'users', firebaseUser.uid), {
      name: cleanName, email: firebaseUser.email || '', phone: phone.trim(), role: 'seller',
      avatar: firebaseUser.photoURL || '', addresses: currentUser.addresses || [], shopId, shopName: cleanShop,
      sellerLocation: { state: cleanState, district: cleanDistrict, marketId: customMarketId, marketName: cleanMarket },
      updatedAt: serverTimestamp(),
    }, { merge: true });
    batch.set(doc(firebaseDb, 'shops', shopId), shopDoc);
    await batch.commit();
    await firebaseUser.getIdToken(true);
    window.location.reload();
  };

  const handleBecomeSellerSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); resetStatus();
    if (currentUser.role === 'guest') { setError('Please sign in to your Claymarket account before opening a shop.'); setAuthModalTab('login'); return; }
    if (!marketName.trim()) { setError('Please enter or select your market.'); return; }
    setLoading(true);
    try {
      const existingMarket = markets.find(m => m.id === selectedMarketId && m.name === marketName.trim());
      if (existingMarket) {
        await registerSeller({ name: ownerName.trim(), phone: phone.trim(), shop: {
          name: shopName.trim(), marketId: existingMarket.id, categoryId: selectedCategoryId,
          state: stateName.trim(), district: districtName.trim(), address: address.trim(),
        }});
      } else {
        await saveCustomMarketSeller();
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to create your seller account. Please try again.'); }
    finally { setLoading(false); }
  };

  const switchTab = (tab: 'login' | 'register' | 'become-seller') => {
    resetStatus(); setPassword(''); setPasswordVisible(false); setMarketSuggestionsOpen(false); setAuthModalTab(tab);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200" role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby="claymarket-auth-title" className="bg-white rounded-3xl max-w-md w-full max-h-[calc(100vh-2rem)] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-white/90 relative animate-in zoom-in-95 duration-200" style={{ boxShadow: '0 24px 48px -12px rgba(32, 36, 58, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.95)' }}>
        <button onClick={() => setIsAuthModalOpen(false)} aria-label="Close authentication dialog" title="Close" className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5" /></button>
        <div className="flex items-center justify-center gap-2 mb-6 p-1 bg-[#F7F5F3] rounded-2xl">
          {(['login', 'register', 'become-seller'] as const).map(tab => <button key={tab} onClick={() => switchTab(tab)} className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all ${authModalTab === tab ? tab === 'become-seller' ? 'bg-[#8067E8] text-white shadow-xs' : 'bg-white text-[#20243A] shadow-xs' : tab === 'become-seller' ? 'text-[#8067E8] hover:bg-[#DDD4FF]/50' : 'text-[#737B89] hover:text-[#20243A]'}`}>{tab === 'login' ? 'Sign In' : tab === 'register' ? 'Create Account' : 'Become Seller'}</button>)}
        </div>

        {authModalTab !== 'become-seller' ? (
          <div className="space-y-4">
            <div className="text-center space-y-1"><h3 id="claymarket-auth-title" className="text-2xl font-extrabold text-[#20243A]">{authModalTab === 'login' ? 'Welcome Back!' : 'Create an Account'}</h3><p className="text-xs text-[#737B89]">{authModalTab === 'login' ? 'Access your orders, wishlist and direct seller chat.' : 'Create your real Claymarket account.'}</p></div>
            <form onSubmit={authModalTab === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="space-y-3 pt-1">
              {authModalTab === 'register' && <div><label htmlFor="full-name" className="text-xs font-bold text-[#20243A] block mb-1">Full Name</label><input type="text" id="full-name" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Rahul Sharma" autoComplete="name" className="w-full px-4 py-2.5 rounded-xl bg-[#F7F5F3] border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8]" /></div>}
              <div><label htmlFor="email" className="text-xs font-bold text-[#20243A] block mb-1">Email or Phone</label><input type="text" id="email" required value={email} onChange={e => { setEmail(e.target.value); if (error) setError(''); }} placeholder="yourname@gmail.com or +91..." autoComplete="username" className="w-full px-4 py-2.5 rounded-xl bg-[#F7F5F3] border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8]" /></div>
              {authModalTab === 'register' && <div><label htmlFor="phone" className="text-xs font-bold text-[#20243A] block mb-1">Phone <span className="font-medium text-gray-400">(optional)</span></label><input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" autoComplete="tel" className="w-full px-4 py-2.5 rounded-xl bg-[#F7F5F3] border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8]" /></div>}
              <div><label htmlFor="password" className="text-xs font-bold text-[#20243A] block mb-1">Password</label><div className="relative"><input type={passwordVisible ? 'text' : 'password'} id="password" required minLength={8} value={password} onChange={e => { setPassword(e.target.value); if (error) setError(''); }} placeholder="At least 8 characters" autoComplete={authModalTab === 'login' ? 'current-password' : 'new-password'} className="w-full px-4 py-2.5 pr-11 rounded-xl bg-[#F7F5F3] border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8]" /><button type="button" onClick={() => setPasswordVisible(v => !v)} aria-label={passwordVisible ? 'Hide password' : 'Show password'} title={passwordVisible ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-[#737B89] hover:text-[#20243A] hover:bg-white">{passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
              {error && <div role="alert" aria-live="polite" className="flex items-start gap-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span></div>}
              <button type="submit" disabled={loading} aria-busy={loading} className="w-full py-3 rounded-full bg-[#8067E8] hover:bg-[#6E52E2] disabled:opacity-70 disabled:cursor-wait active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all mt-2 flex items-center justify-center gap-2">{loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>{authModalTab === 'login' ? 'Signing in…' : 'Creating account…'}</span></> : authModalTab === 'login' ? 'Sign In' : 'Create Account'}</button>
              <p className="text-[11px] text-center text-[#737B89] pt-1">Your account is securely managed with Firebase Authentication.</p>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-1"><div className="w-12 h-12 rounded-2xl bg-[#DDD4FF] text-[#6C4DE6] flex items-center justify-center mx-auto shadow-xs"><Store className="w-6 h-6" /></div><h3 className="text-2xl font-extrabold text-[#20243A]">Open Your Local Shop</h3><p className="text-xs text-[#737B89]">Add your exact area and shop details so nearby customers can find you.</p></div>
            <form onSubmit={handleBecomeSellerSubmit} className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3"><div><label htmlFor="seller-owner-name" className="text-xs font-bold text-[#20243A] block mb-1">Your Name</label><input id="seller-owner-name" type="text" required value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="Aminul Islam" autoComplete="name" className="w-full px-3 py-2.5 rounded-xl bg-[#F7F5F3] border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8]" /></div><div><label htmlFor="seller-phone" className="text-xs font-bold text-[#20243A] block mb-1">Phone <span className="font-medium text-gray-400">(optional)</span></label><input id="seller-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91..." autoComplete="tel" className="w-full px-3 py-2.5 rounded-xl bg-[#F7F5F3] border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8]" /></div></div>
              <div><label htmlFor="shop-name" className="text-xs font-bold text-[#20243A] block mb-1">Shop Name</label><input id="shop-name" type="text" required value={shopName} onChange={e => setShopName(e.target.value)} placeholder="e.g. Aminul Slipper Shop" className="w-full px-4 py-2.5 rounded-xl bg-[#F7F5F3] border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8]" /></div>
              <div className="grid grid-cols-2 gap-3"><div><label htmlFor="seller-state" className="text-xs font-bold text-[#20243A] block mb-1">State</label><input id="seller-state" type="text" required value={stateName} onChange={e => setStateName(e.target.value)} placeholder="e.g. Assam" autoComplete="address-level1" className="w-full px-3 py-2.5 rounded-xl bg-[#F7F5F3] border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8]" /></div><div><label htmlFor="seller-district" className="text-xs font-bold text-[#20243A] block mb-1">District</label><input id="seller-district" type="text" required value={districtName} onChange={e => setDistrictName(e.target.value)} placeholder="e.g. Barpeta" autoComplete="address-level2" className="w-full px-3 py-2.5 rounded-xl bg-[#F7F5F3] border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8]" /></div></div>

              <div ref={marketRef} className="relative"><label htmlFor="market-location" className="text-xs font-bold text-[#20243A] block mb-1">Market</label><div className="relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" /><input id="market-location" type="text" required value={marketName} onChange={e => { setMarketName(e.target.value); setSelectedMarketId(''); setSelectedMarketPlace(null); setMarketSuggestionsOpen(true); }} onFocus={() => setMarketSuggestionsOpen(true)} placeholder="Search or type market..." autoComplete="off" className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-[#F7F5F3] border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8]" /><ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${marketSuggestionsOpen ? 'rotate-180' : ''}`} /></div>
                {marketSuggestionsOpen && (marketSuggestions.length > 0 || marketLoading || marketName.trim()) && <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-100 shadow-2xl z-[70] overflow-hidden max-h-72 overflow-y-auto">{marketLoading && marketSuggestions.length === 0 ? <div className="flex items-center gap-2 px-3 py-3 text-xs text-gray-400"><Loader2 className="w-4 h-4 animate-spin" />Searching places...</div> : <>{marketSuggestions.map(place => <button key={place.id} type="button" onClick={() => { setMarketName(place.label); setSelectedMarketId(''); setSelectedMarketPlace(place); setMarketSuggestionsOpen(false); }} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F7F5FE] text-left"><div className="w-8 h-8 rounded-xl bg-[#CBE4FF] text-[#1B5899] flex items-center justify-center shrink-0"><MapPin className="w-4 h-4" /></div><div className="min-w-0"><p className="text-sm font-bold text-[#20243A] truncate">{place.label}</p>{place.sublabel && <p className="text-[11px] text-[#737B89] truncate">{place.sublabel}</p>}</div></button>)}{marketName.trim() && <div className="border-t border-gray-100 p-2"><button type="button" onClick={() => { setSelectedMarketId(''); setSelectedMarketPlace(null); setMarketSuggestionsOpen(false); }} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F7F5FE] text-left"><div className="w-8 h-8 rounded-xl bg-[#E9F7EC] text-[#176F43] flex items-center justify-center shrink-0"><Store className="w-4 h-4" /></div><div><p className="text-sm font-bold text-[#20243A]">Use "{marketName.trim()}"</p><p className="text-[11px] text-[#737B89]">Save this market manually</p></div></button></div>}</>}</div>}
                {selectedMarketPlace && <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#EEF7FF] border border-[#CBE4FF]"><MapPin className="w-4 h-4 text-[#1B5899]" /><p className="text-[11px] font-semibold text-[#1B5899] truncate">{selectedMarketPlace.label}</p></div>}
              </div>

              <div><label htmlFor="seller-category" className="text-xs font-bold text-[#20243A] block mb-1">Category</label><select id="seller-category" required value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-[#F7F5F3] border border-gray-200 text-xs font-bold text-[#20243A] focus:outline-none focus:ring-2 focus:ring-[#8067E8]">{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label htmlFor="stall-address" className="text-xs font-bold text-[#20243A] block mb-1">Stall Number / Address <span className="font-medium text-gray-400">(optional)</span></label><input id="stall-address" type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. Stall #14, Footwear Lane" className="w-full px-4 py-2.5 rounded-xl bg-[#F7F5F3] border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8]" /></div>
              {error && <div role="alert" aria-live="polite" className="flex items-start gap-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span></div>}
              <button type="submit" disabled={loading} aria-busy={loading} className="w-full py-3 rounded-full bg-[#8067E8] hover:bg-[#6E52E2] disabled:opacity-70 disabled:cursor-wait active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all mt-2 flex items-center justify-center gap-2">{loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Creating your shop…</span></> : 'Register My Shop & Start Selling'}</button>
              <p className="text-[11px] text-center text-[#737B89] pt-1">Your account and shop profile are securely stored with Firebase.</p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
