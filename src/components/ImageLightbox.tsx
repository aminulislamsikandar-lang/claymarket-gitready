import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  startIndex: number;
  title?: string;
  onClose: () => void;
}

const SWIPE_THRESHOLD = 50;

/**
 * Fullscreen product image viewer.
 *  - Double-click / double-tap the image to zoom in, double-click again to zoom out.
 *  - Swipe left/right (touch) or use the arrow buttons / arrow keys to move
 *    between a product's photos.
 *  - Esc, the backdrop, or the close button dismiss the viewer.
 */
export const ImageLightbox: React.FC<ImageLightboxProps> = ({ images, startIndex, title, onClose }) => {
  const [index, setIndex] = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const safeImages = images.length > 0 ? images : [''];
  const goTo = (next: number) => {
    setZoomed(false);
    setIndex(((next % safeImages.length) + safeImages.length) % safeImages.length);
  };
  const goPrev = () => goTo(index - 1);
  const goNext = () => goTo(index + 1);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const handleImageDoubleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const originX = ((e.clientX - rect.left) / rect.width) * 100;
    const originY = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${originX}% ${originY}%`);
    setZoomed(z => !z);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null || zoomed) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) goPrev(); else goNext();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#15192C]/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Product image viewer'}
    >
      <button
        onClick={e => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all cursor-pointer"
        title="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {title && (
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 px-3.5 py-1.5 rounded-full bg-white/10 text-white text-xs sm:text-sm font-bold backdrop-blur-md max-w-[55%] truncate">
          {title}
        </div>
      )}

      {safeImages.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); goPrev(); }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all cursor-pointer"
            title="Previous image"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); goNext(); }}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all cursor-pointer"
            title="Next image"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      <div
        className="relative w-full h-full flex items-center justify-center px-4 py-16 sm:p-20 overflow-hidden"
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          key={index}
          src={safeImages[index]}
          alt={title || `Product image ${index + 1}`}
          onDoubleClick={handleImageDoubleClick}
          draggable={false}
          className={`max-w-full max-h-full object-contain select-none transition-transform duration-300 ease-out animate-in fade-in zoom-in-95 duration-200 ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
          style={{ transform: zoomed ? 'scale(2.4)' : 'scale(1)', transformOrigin: origin }}
        />
      </div>

      <button
        onClick={e => { e.stopPropagation(); setZoomed(z => !z); }}
        className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md transition-all cursor-pointer"
        title={zoomed ? 'Zoom out' : 'Zoom in'}
      >
        {zoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
        <span>{zoomed ? 'Zoom out' : 'Zoom in'}</span>
        {safeImages.length > 1 && <span className="ml-1 pl-2 border-l border-white/25 text-white/70">{index + 1} / {safeImages.length}</span>}
      </button>
    </div>
  );
};
