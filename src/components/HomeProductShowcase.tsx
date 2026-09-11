import React from 'react';
import { useApp } from '../context/AppContext';
import { ProductRow } from './ProductRecommendations';

// Flipkart/Meesho-style homepage sections built entirely from real, live
// products (published listings from Firestore, exposed via AppContext).
// No mock/dummy data — sections simply don't render when a category has
// no live products yet.
export const HomeProductShowcase: React.FC = () => {
  const { products, categories, navigateTo } = useApp();

  const inStock = (p: (typeof products)[number]) => p.inStock !== false;

  const slippersCategory = categories.find(c => c.slug === 'slippers');
  const clothesCategory = categories.find(c => c.slug === 'clothes');

  const slippers = products.filter(p => p.categoryId === slippersCategory?.id && inStock(p));
  const clothes = products.filter(p => p.categoryId === clothesCategory?.id && inStock(p));

  // "Recommended for you": highest-rated items first, across all categories.
  const trending = [...products]
    .filter(inStock)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));

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
