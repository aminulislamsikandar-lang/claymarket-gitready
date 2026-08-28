import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CategoryClayIcon } from './ClayIllustrations';
import { Category } from '../types';

export const BrowseByCategories: React.FC = () => {
  const { categories, navigateTo } = useApp();

  return (
    <section className="py-8">
      {/* Header with Title and "View all categories →" link */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#20243A] tracking-tight">
          Browse by Categories
        </h2>
        <button
          id="view-all-categories-link"
          onClick={() => navigateTo('categories')}
          className="text-sm font-bold text-[#8067E8] hover:text-[#6E52E2] flex items-center gap-1.5 transition-colors group cursor-pointer"
        >
          <span>View all categories</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Grid of 6 Visual Category Cards matching Image 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat: Category) => (
          <div
            key={cat.id}
            id={`category-card-${cat.id}`}
            onClick={() => navigateTo('category-detail', { category: cat })}
            className="group bg-white rounded-3xl p-4 sm:p-5 border border-white/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center cursor-pointer text-center"
            style={{
              boxShadow: '0 8px 24px -4px rgba(32, 36, 58, 0.04), inset 0 2px 3px rgba(255, 255, 255, 0.95)'
            }}
          >
            {/* Pastel Rounded Pill Container for 3D Icon */}
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-3.5 group-hover:scale-108 transition-transform duration-300 shadow-inner"
              style={{
                backgroundColor: cat.iconBg,
              }}
            >
              <CategoryClayIcon type={cat.iconType} className="w-12 h-12 sm:w-14 sm:h-14" />
            </div>

            {/* Category Name */}
            <h3 className="text-sm sm:text-base font-bold text-[#20243A] group-hover:text-[#8067E8] transition-colors leading-tight">
              {cat.name}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
};
