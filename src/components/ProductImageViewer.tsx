import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductImageWithShimmer } from './ProductImageWithShimmer';
import type { ImageFitMode } from '../hooks/useProductViewPreferences';

interface ProductImageViewerProps {
  images: string[];
  alt: string;
  fit: ImageFitMode;
  /** Fixed-height crop frame (large/medium/list/details). */
  frameClassName?: string;
  /**
   * Masonry / no-crop mode: the image sizes itself (no fixed-height frame),
   * so every photo keeps its own natural aspect ratio instead of being
   * cropped or letterboxed. Used by the "Natural Fit" layout.
   */
  natural?: boolean;
  /** Called on a plain single click/tap — usually "go to product detail". */
  onNavigate: () => void;
  /** Called on double click/tap — opens the fullscreen zoom viewer at the given image index. */
  onOpenLightbox: (index: number) => void;
  children?: React.ReactNode;
}

/** Self-sizing image for the masonry "Natural Fit" layout — no h-full trick, so it never collapses to zero height. */
const NaturalImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  return (
    <>
      {!loaded && !errored && <div className="w-full aspect-[4/5] rounded-2xl shimmer-loading" />}
      {errored ? (
        <div className="w-full aspect-[4/5] rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 text-xs font-semibold">No image</div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={`w-full h-auto block object-contain transition-opacity duration-500 ${loaded ? 'opacity-100' : 'hidden'}`}
        />
      )}
    </>
  );
};

const SWIPE_THRESHOLD = 40;
const DOUBLE_CLICK_WINDOW = 280;

/**
 * A single click navigates to the product; a second click within the
 * double-click window instead opens the zoom lightbox — this avoids the
 * classic dblclick-fires-two-click-events problem and works the same for
 * mouse and touch.
 */
export const ProductImageViewer: React.FC<ProductImageViewerProps> = ({ images, alt, fit, frameClassName, natural, onNavigate, onOpenLightbox, children }) => {
  const safeImages = images && images.length > 0 ? images : [''];
  const [index, setIndex] = useState(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);

  const goTo = (e: React.MouseEvent, next: number) => {
    e.stopPropagation();
    setIndex(((next % safeImages.length) + safeImages.length) % safeImages.length);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      onOpenLightbox(index);
    } else {
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
        onNavigate();
      }, DOUBLE_CLICK_WINDOW);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || safeImages.length < 2) { touchStartX.current = null; return; }
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      setIndex(prev => ((dx > 0 ? prev - 1 : prev + 1) + safeImages.length) % safeImages.length);
    }
    touchStartX.current = null;
  };

  const imageClass = fit === 'cover'
    ? 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
    : 'w-full h-full object-contain p-1.5 bg-[#F7F5FE] group-hover:scale-[1.02] transition-transform duration-300';

  return (
    <div
      className={`relative ${frameClassName ?? 'w-full h-full'} ${natural ? '' : 'overflow-hidden'} bg-gray-100 select-none`}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      title="Tap to view · double-tap to zoom"
    >
      {natural ? (
        <div key={index} className="rounded-2xl overflow-hidden animate-in fade-in duration-200">
          <NaturalImage src={safeImages[index]} alt={alt} />
        </div>
      ) : (
        <div key={index} className="absolute inset-0 animate-in fade-in duration-200">
          <ProductImageWithShimmer src={safeImages[index]} alt={alt} className={imageClass} />
        </div>
      )}

      {safeImages.length > 1 && (
        <>
          <button
            onClick={e => goTo(e, index - 1)}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white/80 text-[#20243A] shadow-xs opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer"
            title="Previous image"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={e => goTo(e, index + 1)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white/80 text-[#20243A] shadow-xs opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer"
            title="Next image"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
            {safeImages.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-3.5 bg-white' : 'w-1.5 bg-white/60'}`} />
            ))}
          </div>
        </>
      )}

      {children}
    </div>
  );
};
