import type { ImgHTMLAttributes } from 'react';
import {
  buildOptimizedUrl,
  buildSrcSet,
  isCloudinaryUrl,
  RESPONSIVE_WIDTHS,
  DEFAULT_SIZES,
} from '../utils/cloudinaryOptimizer';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'srcSet'> {
  src: string;
  alt: string;
  /** Widths to generate a srcset for. Defaults to RESPONSIVE_WIDTHS. */
  widths?: readonly number[];
  /** `sizes` attribute — how much viewport width this image occupies at each breakpoint. */
  sizes?: string;
  /**
   * Mark above-the-fold images (hero banners, first product card) as
   * priority: they load eagerly with high fetch priority instead of
   * lazy-loading, so the biggest visible image isn't delayed.
   */
  priority?: boolean;
}

/**
 * Drop-in replacement for <img> that adds Cloudinary responsive sizing,
 * auto format/quality, and lazy-loading — with zero effect on non-Cloudinary
 * sources (falls back to a plain <img src>).
 *
 * Usage:
 *   <OptimizedImage src={product.image} alt={product.name} />
 *   <OptimizedImage src={shop.banner} alt={shop.name} priority />
 */
export function OptimizedImage({
  src,
  alt,
  widths = RESPONSIVE_WIDTHS,
  sizes = DEFAULT_SIZES,
  priority = false,
  loading,
  width,
  height,
  ...rest
}: OptimizedImageProps) {
  const cloudinary = isCloudinaryUrl(src);
  const largestWidth = widths[widths.length - 1];
  const optimizedSrc = cloudinary ? buildOptimizedUrl(src, { width: largestWidth }) : src;
  const srcSet = cloudinary ? buildSrcSet(src, widths) : undefined;

  return (
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : loading ?? 'lazy'}
      decoding="async"
      {...({ fetchPriority: priority ? 'high' : 'auto' } as Record<string, string>)}
      {...rest}
    />
  );
}
