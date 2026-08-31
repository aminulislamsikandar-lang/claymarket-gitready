import React, { useState, useEffect } from 'react';
import { X, Store, Loader2, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiRequest } from '../utils/api';
import { Shop } from '../types';

interface EditShopDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop;
}

export const EditShopDetailsModal: React.FC<EditShopDetailsModalProps> = ({ isOpen, onClose, shop }) => {
  const { updateShopDetails } = useApp();

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [about, setAbout] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [onlineOrdering, setOnlineOrdering] = useState(true);
  const [isLoadingOrderingSetting, setIsLoadingOrderingSetting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setPhone(shop.phone || '');
    setAddress(shop.address || '');
    setAbout(shop.about || '');
    setOpeningHours(shop.openingHours || '');
    setOnlineOrdering(shop.onlineOrdering !== false);

    const loadOrderingSetting = async () => {
      setIsLoadingOrderingSetting(true);
      try {
        const remote = await apiRequest<any>(`/shops/${shop.id}`);
        if (!cancelled && typeof remote?.onlineOrdering === 'boolean') setOnlineOrdering(remote.onlineOrdering);
      } catch {
        // Keep the value supplied by the current shop object for offline/fallback mode.
      } finally {
        if (!cancelled) setIsLoadingOrderingSetting(false);
      }
    };
    void loadOrderingSetting();
    return () => { cancelled = true; };
  }, [isOpen, shop]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const success = await updateShopDetails(shop.id, {
        phone: phone.trim(),
        address: address.trim(),
        about: about.trim(),
        openingHours: openingHours.trim(),
      });
      if (!success) return;

      await apiRequest(`/shops/${shop.id}`, {
        method: 'PUT',
        body: JSON.stringify({ onlineOrdering }),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-gray-100 my-auto animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#F1EDFD] text-[#8067E8] flex items-center justify-center shrink-0"><Store className="w-4.5 h-4.5" /></div>
            <div><h3 className="font-extrabold text-lg text-[#20243A]">Edit Shop Details</h3><p className="text-xs text-[#737B89] mt-0.5">Update your contact info, address & story</p></div>
          </div>
          <button id="close-shop-details-modal-btn" onClick={onClose} className="p-2 rounded-full hover:bg-[#FAF8FE] text-gray-400 hover:text-[#20243A] transition-colors cursor-pointer" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-xs font-bold text-[#20243A] block mb-1">Phone Number</label><input type="tel" id="edit-shop-phone-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F3] border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8] transition-all" /></div>
          <div><label className="text-xs font-bold text-[#20243A] block mb-1">Stall / Shop Address</label><input type="text" id="edit-shop-address-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. Stall #14, Footwear Alley, Kachumara Market" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F3] border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8] transition-all" /></div>
          <div><label className="text-xs font-bold text-[#20243A] block mb-1">Working Hours</label><input type="text" id="edit-shop-hours-input" value={openingHours} onChange={e => setOpeningHours(e.target.value)} placeholder="e.g. 8:00 AM - 8:30 PM" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F3] border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8] transition-all" /></div>

          <div className="rounded-2xl border border-gray-200 bg-[#FAF9FD] p-4 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3"><div className="w-9 h-9 rounded-xl bg-white text-[#8067E8] flex items-center justify-center shrink-0 border border-gray-100"><ShoppingBag className="w-4 h-4" /></div><div><label htmlFor="online-ordering-toggle" className="text-sm font-extrabold text-[#20243A] block cursor-pointer">Accept online orders</label><p className="text-xs text-[#737B89] mt-0.5">Allow buyers to place orders from your shop online.</p></div></div>
            <button type="button" id="online-ordering-toggle" role="switch" aria-checked={onlineOrdering} disabled={isLoadingOrderingSetting || isSubmitting} onClick={() => setOnlineOrdering(value => !value)} className={`relative w-12 h-7 rounded-full transition-colors shrink-0 disabled:opacity-60 ${onlineOrdering ? 'bg-[#8067E8]' : 'bg-gray-300'}`}><span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${onlineOrdering ? 'translate-x-6' : 'translate-x-1'}`} /></button>
          </div>

          <div><label className="text-xs font-bold text-[#20243A] block mb-1">Shop Story</label><textarea rows={3} id="edit-shop-about-input" value={about} onChange={e => setAbout(e.target.value)} placeholder="Tell buyers about your shop..." className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F3] border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8] transition-all resize-none" /></div>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100"><button type="button" onClick={onClose} className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer rounded-full hover:bg-gray-100">Cancel</button><button type="submit" disabled={isSubmitting || isLoadingOrderingSetting} id="save-shop-details-btn" className="px-6 py-2.5 rounded-full bg-[#8067E8] hover:bg-[#6E52E2] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2">{isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}<span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span></button></div>
        </form>
      </div>
    </div>
  );
};
