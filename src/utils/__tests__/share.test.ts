import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shareOrCopy } from '../share';

describe('shareOrCopy', () => {
  const originalShare = (navigator as unknown as { share?: unknown }).share;
  const originalClipboard = navigator.clipboard;

  afterEach(() => {
    Object.defineProperty(navigator, 'share', { value: originalShare, configurable: true });
    Object.defineProperty(navigator, 'clipboard', { value: originalClipboard, configurable: true });
    vi.restoreAllMocks();
  });

  it('uses the Web Share API when available and reports "shared"', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });

    const result = await shareOrCopy({ title: 'Claymarket', text: 'Check this out', url: 'https://claymarket.example.com/products/1' });

    expect(share).toHaveBeenCalledWith({
      title: 'Claymarket',
      text: 'Check this out',
      url: 'https://claymarket.example.com/products/1',
    });
    expect(result).toBe('shared');
  });

  it('falls back to the clipboard when the Web Share API is unavailable', async () => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    const result = await shareOrCopy({ title: 'Claymarket', text: 'Check this out', url: 'https://claymarket.example.com/shops/1' });

    expect(writeText).toHaveBeenCalledWith('https://claymarket.example.com/shops/1');
    expect(result).toBe('copied');
  });

  it('still reports "shared" if the user cancels the native share sheet', async () => {
    // navigator.share() rejects when the user dismisses the sheet — that's
    // not a real failure, so the caller should not treat it as one.
    const share = vi.fn().mockRejectedValue(new DOMException('Abort', 'AbortError'));
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });

    const result = await shareOrCopy({ title: 'Claymarket', text: 'Check this out' });
    expect(result).toBe('shared');
  });
});
