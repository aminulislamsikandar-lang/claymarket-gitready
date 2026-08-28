import React, { useRef, useState } from 'react';
import { 
  User as UserIcon, MapPin, Mail, Phone, ShieldCheck, 
  Store, Plus, Trash2, ArrowLeft, ChevronRight, Edit3, 
  CheckCircle2, Bell, Sparkles, Camera, Loader2 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const UserProfileView: React.FC = () => {
  const { 
    currentUser, navigateTo, goBack, 
    setAuthModalTab, setIsAuthModalOpen, showToast, updateProfilePicture 
  } = useApp();

  const initialAddresses = currentUser.addresses && currentUser.addresses.length > 0
    ? currentUser.addresses.map(a => `${a.label ? `[${a.label}] ` : ''}${a.street}, ${a.city}`)
    : [
        'House 42, Main Road, Near Kachumara Market Gate',
        'Shop #14, Footwear Alley, Kachumara'
      ];

  const [addresses, setAddresses] = useState<string[]>(initialAddresses);
  const [newAddressInput, setNewAddressInput] = useState('');
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      await updateProfilePicture(file);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Could not update your profile picture. Please try again.',
        'error',
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressInput.trim()) return;
    setAddresses([...addresses, newAddressInput.trim()]);
    setNewAddressInput('');
    setIsAddingAddress(false);
    showToast('Saved new delivery / pickup address', 'success');
  };

  const handleDeleteAddress = (idx: number) => {
    setAddresses(addresses.filter((_, i) => i !== idx));
    showToast('Address removed', 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      
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
          <span className="font-bold text-[#20243A]">My Profile</span>
        </div>
      </div>

      {/* Main Profile Overview Card */}
      <div 
        className="bg-white rounded-3xl p-6 sm:p-8 border border-white/90 shadow-sm"
        style={{
          boxShadow: '0 16px 36px -10px rgba(32, 36, 58, 0.08), inset 0 2px 4px rgba(255, 255, 255, 0.95)'
        }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative shrink-0">
            {currentUser.avatar ? (
              <img loading="lazy" decoding="async" 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-24 h-24 rounded-3xl object-cover ring-4 ring-[#DDD4FF] shadow-md"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-3xl bg-[#F1EDFD] text-[#6C4DE6] ring-4 ring-[#DDD4FF] shadow-md flex items-center justify-center text-3xl font-extrabold"
                aria-label="No profile picture"
              >
                {currentUser.name.charAt(0).toUpperCase() || 'C'}
              </div>
            )}

            <input
              ref={profileImageInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleProfilePictureChange}
            />

            <button
              type="button"
              onClick={() => profileImageInputRef.current?.click()}
              disabled={isUploadingAvatar}
              aria-label="Change profile picture"
              title="Change profile picture"
              className="absolute -right-2 -bottom-2 w-9 h-9 rounded-full bg-[#8067E8] hover:bg-[#6E52E2] text-white border-4 border-white shadow-md flex items-center justify-center transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isUploadingAvatar ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#20243A]">
                {currentUser.name}
              </h1>
              <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                currentUser.role === 'seller' 
                  ? 'bg-[#DDD4FF] text-[#553BB8]' 
                  : currentUser.role === 'buyer' 
                  ? 'bg-[#CBEFD9] text-[#176F43]' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {currentUser.role === 'seller' ? 'Seller + Buyer Account' : currentUser.role === 'buyer' ? 'Public Buyer Account' : 'Guest'}
              </span>
            </div>

            <p className="text-sm text-[#737B89]">{currentUser.email || 'customer@claymarket.local'}</p>
            <p className="text-[11px] text-[#8067E8] font-semibold">Click the camera icon to change your profile picture.</p>

            {currentUser.shopName && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FAF8FE] border border-[#DDD4FF] rounded-2xl text-xs font-bold text-[#6C4DE6] mt-2">
                <Store className="w-4 h-4" />
                <span>Shop: {currentUser.shopName}</span>
              </div>
            )}

            {currentUser.sellerLocation && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-[#737B89] mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F5F3] rounded-full"><MapPin className="w-3.5 h-3.5 text-[#8067E8]" />{currentUser.sellerLocation.marketName}</span>
                <span>{currentUser.sellerLocation.district}, {currentUser.sellerLocation.state}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {currentUser.role === 'buyer' && (
              <button
                onClick={() => {
                  setAuthModalTab('become-seller');
                  setIsAuthModalOpen(true);
                }}
                className="w-full px-5 py-2.5 rounded-full bg-[#8067E8] hover:bg-[#6E52E2] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Become a Seller</span>
              </button>
            )}

            {currentUser.role === 'seller' && (
              <button
                onClick={() => navigateTo('seller-dashboard')}
                className="w-full px-5 py-2.5 rounded-full bg-[#8067E8] hover:bg-[#6E52E2] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Store className="w-4 h-4" />
                <span>Seller Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Saved Addresses Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-white/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-[#20243A]">Saved Delivery / Pickup Locations</h3>
            <p className="text-xs text-[#737B89]">Manage your frequent market pickup addresses</p>
          </div>
          <button
            onClick={() => setIsAddingAddress(!isAddingAddress)}
            className="px-4 py-2 bg-[#F1EDFD] hover:bg-[#DDD4FF] text-[#6C4DE6] rounded-full font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Address</span>
          </button>
        </div>

        {isAddingAddress && (
          <form onSubmit={handleAddAddress} className="p-4 bg-[#FAF8FE] rounded-2xl border border-[#DDD4FF] space-y-3">
            <label htmlFor="new-address" className="text-xs font-bold text-[#20243A] block">New Address / Stall Location</label>
            <input
              type="text"
              id="new-address"
              required
              value={newAddressInput}
              onChange={e => setNewAddressInput(e.target.value)}
              placeholder="e.g. Block C, Stall #18, Kachumara Market"
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingAddress(false)}
                className="px-3 py-1.5 text-xs text-gray-500 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#8067E8] text-white text-xs font-bold rounded-full shadow-xs"
              >
                Save Location
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2.5">
          {addresses.map((addr, i) => (
            <div key={i} className="p-3.5 bg-[#FDFCFB] rounded-2xl border border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#DDD4FF] text-[#8067E8] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-[#20243A]">{addr}</span>
              </div>

              <button
                onClick={() => handleDeleteAddress(i)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
