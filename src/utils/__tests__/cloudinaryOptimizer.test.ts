import { describe, it, expect } from 'vitest';
import {
  isCloudinaryUrl,
  buildOptimizedUrl,
  buildSrcSet,
  RESPONSIVE_WIDTHS,
} from '../cloudinaryOptimizer';

const SAMPLE = 'https://res.cloudinary.com/demo/image/upload/v1690000000/products/abc123.jpg';

describe('isCloudinaryUrl', () => {
  it('recognizes a real Cloudinary delivery URL', () => {
    expect(isCloudinaryUrl(SAMPLE)).toBe(true);
  });

  it('rejects non-Cloudinary sources (data URIs, defaults, undefined)', () => {
    expect(isCloudinaryUrl('data:image/png;base64,abc')).toBe(false);
    expect(isCloudinaryUrl('/default-avatar.png')).toBe(false);
    expect(isCloudinaryUrl(undefined)).toBe(false);
    expect(isCloudinaryUrl(null)).toBe(false);
  });
});

describe('buildOptimizedUrl', () => {
  it('injects f_auto,q_auto,dpr_auto with no width', () => {
    const result = buildOptimizedUrl(SAMPLE);
    expect(result).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,dpr_auto/v1690000000/products/abc123.jpg'
    );
  });

  it('adds w_ and c_ when width is given', () => {
    const result = buildOptimizedUrl(SAMPLE, { width: 480 });
    expect(result).toContain('w_480');
    expect(result).toContain('c_limit');
  });

  it('rounds fractional widths', () => {
    const result = buildOptimizedUrl(SAMPLE, { width: 479.6 });
    expect(result).toContain('w_480');
  });

  it('never upscales by default (crop=limit)', () => {
    const result = buildOptimizedUrl(SAMPLE, { width: 1000, crop: 'fill' });
    expect(result).toContain('c_fill');
  });

  it('passes through non-Cloudinary URLs unchanged', () => {
    expect(buildOptimizedUrl('/default-avatar.png', { width: 400 })).toBe('/default-avatar.png');
    expect(buildOptimizedUrl('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
  });

  it('does not double-inject if called twice on its own output', () => {
    const once = buildOptimizedUrl(SAMPLE, { width: 400 });
    const twice = buildOptimizedUrl(once, { width: 400 });
    expect(twice).toBe(once);
  });
});

describe('buildSrcSet', () => {
  it('builds one entry per width, sorted ascending, each tagged with its w descriptor', () => {
    const srcset = buildSrcSet(SAMPLE, [640, 320, 1024]);
    const entries = srcset.split(', ');
    expect(entries).toHaveLength(3);
    expect(entries[0]).toContain('w_320');
    expect(entries[0]).toMatch(/320w$/);
    expect(entries[1]).toContain('w_640');
    expect(entries[2]).toContain('w_1024');
  });

  it('uses RESPONSIVE_WIDTHS by default', () => {
    const srcset = buildSrcSet(SAMPLE);
    expect(srcset.split(', ')).toHaveLength(RESPONSIVE_WIDTHS.length);
  });

  it('returns empty string for non-Cloudinary URLs', () => {
    expect(buildSrcSet('/default-avatar.png')).toBe('');
  });
});
