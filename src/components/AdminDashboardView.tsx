import React, { useState } from 'react';
import { Store, Plus, Trash2, ArrowLeft, ShieldAlert, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminDashboardView: React.FC = () => {
  const { currentUser, markets, addMarketAdmin, deleteMarketAdmin, navigateTo, goBack, showToast } = useApp();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Guard: only admins may see this view, even if someone navigates here directly.
  if (currentUser.role !== 'admin') {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-[#20243A] mb-2">Admin access required</h2>
        <p className="text-sm text-[#737B89] mb-6">
          This page is only available to Claymarket administrators.
        </p>
        <button
          onClick={() => navigateTo('markets')}
          className="clay-button-primary px-6 py-2.5 font-bold text-sm"
        >
          Back to Markets
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim() || !description.trim()) {
      showToast('Please fill in the market name, location and description.', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      await addMarketAdmin({ name, location, description, bannerImage: bannerImage || undefined });
      showToast(`"${name.trim()}" was added.`, 'success');
      setName('');
      setLocation('');
      setDescription('');
      setBannerImage('');
    } catch (err: any) {
      showToast(err?.message || 'Could not add the market. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (marketId: string, marketName: string) => {
    if (!window.confirm(`Remove "${marketName}"? This cannot be undone.`)) return;
    setDeletingId(marketId);
    try {
      await deleteMarketAdmin(marketId);
      showToast(`"${marketName}" was removed.`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Could not remove the market. Please try again.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="py-6 max-w-4xl mx-auto">
      <button
        onClick={goBack}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#737B89] hover:text-[#20243A] transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-[#8067E8] text-white flex items-center justify-center shadow-md">
          <Store className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#20243A] tracking-tight">Manage Markets</h1>
          <p className="text-sm text-[#737B89]">Add or remove markets shown across Claymarket.</p>
        </div>
      </div>

      {/* Add Market Form */}
      <form onSubmit={handleSubmit} className="clay-card p-5 sm:p-6 space-y-4 mb-8">
        <h2 className="font-bold text-base text-[#20243A]">Add a new market</h2>

        <div>
          <label className="block text-xs font-bold text-[#505767] mb-1.5">Market name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Nalbari Weekly Haat"
            className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200/90 text-sm text-[#20243A] focus:outline-none focus:ring-2 focus:ring-[#8067E8]/40 focus:border-[#8067E8]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#505767] mb-1.5">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Nalbari Town, Assam"
            className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200/90 text-sm text-[#20243A] focus:outline-none focus:ring-2 focus:ring-[#8067E8]/40 focus:border-[#8067E8]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#505767] mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short description of this market"
            rows={3}
            className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200/90 text-sm text-[#20243A] focus:outline-none focus:ring-2 focus:ring-[#8067E8]/40 focus:border-[#8067E8] resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#505767] mb-1.5">Banner image URL (optional)</label>
          <input
            type="text"
            value={bannerImage}
            onChange={(e) => setBannerImage(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200/90 text-sm text-[#20243A] focus:outline-none focus:ring-2 focus:ring-[#8067E8]/40 focus:border-[#8067E8]"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="clay-button-primary px-6 py-2.5 font-bold text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          <span>{isSubmitting ? 'Adding...' : 'Add Market'}</span>
        </button>
      </form>

      {/* Existing Markets List */}
      <div className="space-y-3">
        <h2 className="font-bold text-base text-[#20243A]">Live markets ({markets.length})</h2>
        {markets.length === 0 ? (
          <p className="text-sm text-[#737B89] py-8 text-center">No markets yet. Add your first one above.</p>
        ) : (
          markets.map((market) => (
            <div
              key={market.id}
              className="clay-card-static p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  loading="lazy"
                  decoding="async"
                  src={market.bannerImage}
                  alt={market.name}
                  className="w-12 h-12 rounded-xl object-cover shrink-0 bg-gray-100"
                />
                <div className="min-w-0">
                  <p className="font-bold text-sm text-[#20243A] truncate">{market.name}</p>
                  <p className="text-xs text-[#737B89] truncate">{market.location}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(market.id, market.name)}
                disabled={deletingId === market.id}
                aria-label={`Remove ${market.name}`}
                className="p-2.5 rounded-full bg-red-50 hover:bg-red-100 text-red-500 transition-colors shrink-0 disabled:opacity-60"
              >
                {deletingId === market.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
