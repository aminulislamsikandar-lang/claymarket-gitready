import React, { useEffect, useRef, useState } from 'react';
import { Eye, Grid3x3, LayoutGrid, List, Rows3, Image as ImageIcon, Check, Crop, Maximize2, Grid2x2 } from 'lucide-react';
import type { ProductViewLayout, ImageFitMode, ProductViewPreferences } from '../hooks/useProductViewPreferences';

interface ProductViewSwitcherProps {
  prefs: ProductViewPreferences;
  onLayoutChange: (layout: ProductViewLayout) => void;
  onImageFitChange: (fit: ImageFitMode) => void;
  onShowDetailsChange: (show: boolean) => void;
}

const LAYOUT_OPTIONS: { id: ProductViewLayout; label: string; hint: string; icon: React.ReactNode }[] = [
  { id: 'large', label: 'Large Icons', hint: 'Big cards, full details', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'medium', label: 'Medium Icons', hint: 'Compact grid, more per row', icon: <Grid3x3 className="w-4 h-4" /> },
  { id: 'list', label: 'List', hint: 'Rows with thumbnail + details', icon: <List className="w-4 h-4" /> },
  { id: 'details', label: 'Details', hint: 'Table-style rows with columns', icon: <Rows3 className="w-4 h-4" /> },
  { id: 'natural', label: 'Natural Fit', hint: 'No cropping — true image ratio', icon: <Maximize2 className="w-4 h-4" /> },
  { id: 'mosaic', label: 'Mosaic Grid', hint: '2 per row, only 4 fill the screen', icon: <Grid2x2 className="w-4 h-4" /> },
];

/**
 * "View" button + dropdown, styled after the classic Windows Explorer view
 * menu (Large Icons / List / Details) with a couple of extras tuned for a
 * mobile shopping grid: a details on/off toggle and a crop vs. no-crop
 * image-fit toggle.
 */
export const ProductViewSwitcher: React.FC<ProductViewSwitcherProps> = ({ prefs, onLayoutChange, onImageFitChange, onShowDetailsChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const detailsLocked = prefs.layout === 'list' || prefs.layout === 'details' || prefs.layout === 'mosaic';
  const fitLocked = prefs.layout === 'natural' || prefs.layout === 'mosaic';

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${open ? 'bg-[#8067E8] text-white shadow-xs' : 'bg-[#F1EDFD] text-[#553BB8] hover:bg-[#DDD4FF]'}`}
        title="Change how products are displayed"
      >
        <Eye className="w-3.5 h-3.5" />
        <span>View</span>
      </button>

      {open && (
        <div
          className="absolute z-20 top-full left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl border border-white/90 shadow-xl p-3 animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-150 origin-top-left"
          style={{ boxShadow: '0 20px 40px -12px rgba(32, 36, 58, 0.18), inset 0 2px 3px rgba(255, 255, 255, 0.95)' }}
        >
          <p className="px-1.5 pb-2 text-[11px] font-extrabold uppercase tracking-wide text-[#9C93BE]">Layout</p>
          <div className="space-y-1">
            {LAYOUT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => onLayoutChange(opt.id)}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${prefs.layout === opt.id ? 'bg-[#F1EDFD] text-[#553BB8]' : 'hover:bg-[#FAF8FE] text-[#20243A]'}`}
              >
                <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${prefs.layout === opt.id ? 'bg-[#8067E8] text-white' : 'bg-[#F7F5FE] text-[#8067E8]'}`}>{opt.icon}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold truncate">{opt.label}</span>
                  <span className="block text-[11px] text-[#8B8FA3] truncate">{opt.hint}</span>
                </span>
                {prefs.layout === opt.id && <Check className="w-4 h-4 text-[#8067E8] shrink-0" />}
              </button>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2.5">
            <p className="px-1.5 text-[11px] font-extrabold uppercase tracking-wide text-[#9C93BE]">Image display</p>
            <div className={`flex items-center gap-1 p-1 rounded-xl bg-[#FAF8FE] ${fitLocked ? 'opacity-40 pointer-events-none' : ''}`}>
              <button
                onClick={() => onImageFitChange('cover')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${prefs.imageFit === 'cover' ? 'bg-white shadow-xs text-[#553BB8]' : 'text-[#8B8FA3]'}`}
              >
                <Crop className="w-3.5 h-3.5" /> Fill (Crop)
              </button>
              <button
                onClick={() => onImageFitChange('contain')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${prefs.imageFit === 'contain' ? 'bg-white shadow-xs text-[#553BB8]' : 'text-[#8B8FA3]'}`}
              >
                <ImageIcon className="w-3.5 h-3.5" /> Fit (No Crop)
              </button>
            </div>
            {fitLocked && <p className="px-1.5 text-[10px] text-[#9C93BE]">{prefs.layout === 'mosaic' ? 'Mosaic Grid always fills each tile edge-to-edge.' : 'Natural Fit already shows every image uncropped.'}</p>}

            <button
              onClick={() => onShowDetailsChange(!prefs.showDetails)}
              disabled={detailsLocked}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors ${detailsLocked ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#FAF8FE] cursor-pointer'}`}
            >
              <span className="text-left">
                <span className="block text-sm font-bold text-[#20243A]">Show product details</span>
                <span className="block text-[11px] text-[#8B8FA3]">Name, price & sizes under the photo</span>
              </span>
              <span className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${prefs.showDetails ? 'bg-[#8067E8]' : 'bg-gray-200'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${prefs.showDetails ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
