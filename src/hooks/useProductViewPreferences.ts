import { useEffect, useState } from 'react';

/**
 * Product grid layout modes — mirrors the classic "Large Icons / List / Details"
 * switcher found in desktop file explorers, plus a couple of extras tuned for a
 * mobile shopping grid.
 *
 *  - large    : big cards, default look (tall portrait image + full details)
 *  - medium   : denser grid, more items per row, condensed details
 *  - list     : horizontal rows — thumbnail + details side by side
 *  - details  : table-like rows with an explicit column header (most metadata)
 *  - natural  : masonry-style grid where every image keeps its own aspect
 *               ratio — nothing is ever cropped
 *  - mosaic   : tight 2-per-row, image-only grid sized so only 4 tiles
 *               (2x2) fill the viewport at once, separated only by a
 *               hairline black divider — this is the default view
 */
export type ProductViewLayout = 'large' | 'medium' | 'list' | 'details' | 'natural' | 'mosaic';

/** How the product thumbnail fills its frame in the fixed-height layouts. */
export type ImageFitMode = 'cover' | 'contain';

export interface ProductViewPreferences {
  layout: ProductViewLayout;
  imageFit: ImageFitMode;
  showDetails: boolean;
}

// Bumped to v2 so the new mosaic default takes effect even for shoppers who
// already had an old preference (e.g. "large") saved from before.
const STORAGE_KEY = 'cm_product_view_prefs_v2';

const DEFAULT_PREFS: ProductViewPreferences = {
  layout: 'mosaic',
  imageFit: 'cover',
  showDetails: true,
};

const readStoredPrefs = (): ProductViewPreferences => {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return DEFAULT_PREFS;
  }
};

/**
 * Small localStorage-backed preference store so a shopper's chosen grid
 * layout / crop preference sticks around between visits, without needing any
 * backend or context plumbing.
 */
export const useProductViewPreferences = () => {
  const [prefs, setPrefs] = useState<ProductViewPreferences>(readStoredPrefs);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore write failures (private mode, storage full, etc.) */
    }
  }, [prefs]);

  const setLayout = (layout: ProductViewLayout) => setPrefs(prev => ({ ...prev, layout }));
  const setImageFit = (imageFit: ImageFitMode) => setPrefs(prev => ({ ...prev, imageFit }));
  const setShowDetails = (showDetails: boolean) => setPrefs(prev => ({ ...prev, showDetails }));

  return { prefs, setLayout, setImageFit, setShowDetails };
};
