import React from 'react';
import { useApp } from '../context/AppContext';
import { ProductRow } from './ProductRecommendations';

// Flipkart/Meesho-style homepage sections built entirely from real, live
// products (published listings from Firestore, exposed via AppContext).
// No mock/dummy data — sections simply don't render when a category has
// no live products yet.
export const HomeProductShowcase: React.FC = () => {
  const { products, categories, navigateTo } = useApp();

  // Firestore data can briefly be unavailable while the app is loading.
  // Keep this optional homepage section fail-safe so it can never prevent
  // the original homepage from rendering.
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const inStock = (p: (typeof safeProducts)[number]) => p?.inStock !== false;

  const slippersCategory = safeCategories.find(c => c?.slug === 'slippers');
  const clothesCategory = safeCategories.find(c => c?.slug === 'clothes');

  const slippers = safeProducts.filter(p => p?.categoryId === slippersCategory?.id && inStock(p));
  const clothes = safeProducts.filter(p => p?.categoryId === clothesCategory?.id && inStock(p));

  // "Recommended for you": highest-rated items first, across all categories.
  const trending = [...safeProducts]
    .filter(inStock)
    .sort((a, b) => (b?.rating || 0) - (a?.rating || 0));

  return (
    <>
      <ProductRow
        title="Recommended For You"
        subtitle="Popular picks from local shops near you"
        products={trending}
      />

      <ProductRow
        title="Slippers For You"
        subtitle="Comfortable daily footwear, flip-flops & traditional chappals"
        products={slippers}
        onViewAll={slippersCategory ? () => navigateTo('category-detail', { category: slippersCategory }) : undefined}
      />

      <ProductRow
        title="Clothes & Fashion"
        subtitle="Ethnic wear, handloom cotton, daily shirts & fabrics"
        products={clothes}
        onViewAll={clothesCategory ? () => navigateTo('category-detail', { category: clothesCategory }) : undefined}
      />
    </>
  );
};
