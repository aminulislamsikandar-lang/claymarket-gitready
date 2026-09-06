/**
 * Cloudinary responsive-image helpers.
 *
 * Pure string-transform functions that work directly on the secure_url your
 * existing uploadToCloudinary() already returns — zero new config (no cloud
 * name, no upload preset needed here) and can't break anything already
 * stored in Firestore.
 *
 * Cloudinary lets you inject a transformation segment right after `/upload/`
 * in any delivery URL, e.g.
 *   https://res.cloudinary.com/demo/image/upload/v123/products/a.jpg
 *   -> https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_400/v123/products/a.jpg
 * `f_auto` picks the best format per-browser (WebP/AVIF where supported),
 * `q_auto` picks the best quality/size trade-off, and `w_<n>` resizes.
 */

/** Standard responsive breakpoints used to build a srcset. */
export const RESPONSIVE_WIDTHS = [320, 480, 640, 768, 1024, 1280, 1600] as const;

/** Default `sizes` attribute: full-width on mobile, half on tablet, capped on desktop. */
export const DEFAULT_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px';

export type CloudinaryCrop = 'fill' | 'fit' | 'scale' | 'limit' | 'thumb';

export interface CloudinaryUrlOptions {
  /** Target width in px. Omit to only apply format/quality auto-optimization. */
  width?: number;
  /** 'auto' (recommended) or an explicit 0-100 quality. */
  quality?: 'auto' | number;
  /** 'auto' (recommended) picks WebP/AVIF automatically per-browser. */
  format?: 'auto' | 'jpg' | 'png' | 'webp';
  /** Resize mode when `width` is set. 'limit' never upscales — safest default. */
  crop?: CloudinaryCrop;
}

/** True only for actual Cloudinary delivery URLs — everything else (data:, defaults) passes through untouched. */
export function isCloudinaryUrl(url: string | undefined | null): url is string {
  return typeof url === 'string' && /^https?:\/\/res\.cloudinary\.com\//.test(url);
}

/**
 * Returns a Cloudinary URL with an optimization transformation injected.
 * Non-Cloudinary URLs (data: URIs, DEFAULT_AVATAR, custom domains) are
 * returned unchanged — this is always safe to call on any image src.
 */
export function buildOptimizedUrl(url: string, options: CloudinaryUrlOptions = {}): string {
  if (!isCloudinaryUrl(url)) return url;

  const { width, quality = 'auto', format = 'auto', crop = 'limit' } = options;

  const params = [`f_${format}`, `q_${quality}`, 'dpr_auto'];
  if (width && width > 0) {
    params.push(`w_${Math.round(width)}`, `c_${crop}`);
  }
  const transformation = params.join(',');

  if (url.includes(`/upload/${transformation}/`)) return url;
  return url.replace('/upload/', `/upload/${transformation}/`);
}

/**
 * Builds a `srcset` string across RESPONSIVE_WIDTHS (or custom widths) so the
 * browser can pick the right size for its viewport/DPR instead of always
 * downloading the largest version.
 * Returns an empty string for non-Cloudinary URLs — check `isCloudinaryUrl`
 * first, or just use `<OptimizedImage>` which handles this for you.
 */
export function buildSrcSet(
  url: string,
  widths: readonly number[] = RESPONSIVE_WIDTHS,
  options: Omit<CloudinaryUrlOptions, 'width'> = {}
): string {
  if (!isCloudinaryUrl(url)) return '';
  return widths
    .slice()
    .sort((a, b) => a - b)
    .map((w) => `${buildOptimizedUrl(url, { ...options, width: w })} ${w}w`)
    .join(', ');
}
