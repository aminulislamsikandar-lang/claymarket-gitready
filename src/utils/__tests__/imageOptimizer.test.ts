import { describe, it, expect } from 'vitest';
import { validateImageFile, MAX_PRODUCT_PHOTOS } from '../imageOptimizer';

function makeFile({ name = 'photo.jpg', type = 'image/jpeg', sizeBytes = 1024 }: {
  name?: string; type?: string; sizeBytes?: number;
} = {}): File {
  const blob = new Blob([new Uint8Array(sizeBytes)], { type });
  return new File([blob], name, { type });
}

describe('validateImageFile', () => {
  it('accepts a normal JPEG under the size limit', () => {
    const file = makeFile({ name: 'shoe.jpg', type: 'image/jpeg', sizeBytes: 1024 * 1024 });
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('accepts PNG and WEBP too', () => {
    expect(validateImageFile(makeFile({ type: 'image/png', name: 'a.png' })).valid).toBe(true);
    expect(validateImageFile(makeFile({ type: 'image/webp', name: 'a.webp' })).valid).toBe(true);
  });

  it('falls back to checking the file extension when the browser reports no MIME type', () => {
    // Some mobile browsers / file pickers report an empty `type` for HEIC-to-JPEG
    // conversions or unusual uploads — the extension check is the safety net.
    const file = makeFile({ type: '', name: 'photo.jpeg' });
    expect(validateImageFile(file).valid).toBe(true);
  });

  it('rejects unsupported formats like GIF or PDF', () => {
    const result = validateImageFile(makeFile({ type: 'application/pdf', name: 'doc.pdf' }));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/not a supported format/i);
  });

  it('rejects files over 5 MB', () => {
    const result = validateImageFile(makeFile({ sizeBytes: 6 * 1024 * 1024 }));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/too large/i);
  });

  it('accepts a file exactly at the 5 MB boundary', () => {
    const result = validateImageFile(makeFile({ sizeBytes: 5 * 1024 * 1024 }));
    expect(result.valid).toBe(true);
  });
});

describe('MAX_PRODUCT_PHOTOS', () => {
  it('is a sane positive limit', () => {
    expect(MAX_PRODUCT_PHOTOS).toBeGreaterThan(0);
    expect(MAX_PRODUCT_PHOTOS).toBe(8);
  });
});
