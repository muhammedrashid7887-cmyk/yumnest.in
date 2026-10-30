'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { PRODUCTS, CATEGORIES } from '@/data/mockData';
import { ProductCard } from '@/components/products/ProductCard';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'rating-desc';

export const ProductsCatalog: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCategory = searchParams.get('category') || 'All Products';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const pricePresets = [
    { id: 'all', label: 'All Prices' },
    { id: 'under-250', label: 'Under ₹250' },
    { id: '250-500', label: '₹250 – ₹500' },
    { id: '500-750', label: '₹500 – ₹750' },
    { id: 'above-750', label: '₹750+' },
  ];

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // 1. Category
      if (selectedCategory !== 'All Products' && product.category !== selectedCategory) {
        return false;
      }

      // 2. Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesMalayalam = product.malayalamName?.toLowerCase().includes(q) || false;
        const matchesCategory = product.category.toLowerCase().includes(q);
        const matchesDesc = product.shortDescription.toLowerCase().includes(q);
        const matchesIngredients = product.ingredients.some((ing) => ing.toLowerCase().includes(q));

        if (!matchesName && !matchesMalayalam && !matchesCategory && !matchesDesc && !matchesIngredients) {
          return false;
        }
      }

      // 3. Price
      const basePrice = product.variants[0]?.salePrice || product.variants[0]?.price || 0;
      if (priceRange === 'under-250' && basePrice >= 250) return false;
      if (priceRange === '250-500' && (basePrice < 250 || basePrice > 500)) return false;
      if (priceRange === '500-750' && (basePrice < 500 || basePrice > 750)) return false;
      if (priceRange === 'above-750' && basePrice < 750) return false;

      return true;
    }).sort((a, b) => {
      const priceA = a.variants[0]?.salePrice || a.variants[0]?.price || 0;
      const priceB = b.variants[0]?.salePrice || b.variants[0]?.price || 0;

      switch (sortBy) {
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        case 'rating-desc':
          return b.rating - a.rating;
        case 'popular':
        default:
          return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      }
    });
  }, [selectedCategory, searchQuery, priceRange, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Products');
    setPriceRange('all');
    setSortBy('popular');
    setCurrentPage(1);
    router.replace('/products');
  };

  const hasActiveFilters = 
    selectedCategory !== 'All Products' || 
    searchQuery.trim() !== '' || 
    priceRange !== 'all';

  return (
    <div className="min-h-screen bg-[#FBF9F5] pb-16">
      
      {/* Page Title & Breadcrumbs */}
      <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-stone-200/80">
          <div>
            <nav className="text-xs text-stone-500 mb-1 flex items-center gap-1.5" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#12372A] transition-colors">Home</Link>
              <span>/</span>
              <span className="text-stone-400">Products</span>
              {selectedCategory !== 'All Products' && (
                <>
                  <span>/</span>
                  <span className="text-[#12372A] font-semibold">{selectedCategory}</span>
                </>
              )}
            </nav>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#12372A] tracking-tight">
              {selectedCategory === 'All Products' ? 'All Products' : selectedCategory}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500">
            Explore authentic Kerala spices, pure masalas & single-estate blends
          </p>
        </div>
      </div>

      {/* 2. Main Layout (Sidebar on Left, Products on Right) */}
      <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#12372A]"
              />
            </div>

            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold text-[#12372A] flex items-center gap-1.5 shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters {hasActiveFilters && '•'}</span>
            </button>
          </div>

          {/* LEFT SIDEBAR (Desktop always visible, Mobile modal/collapsible) */}
          <aside className={`lg:col-span-3 space-y-6 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            
            {/* Search Input (Desktop) */}
            <div className="hidden lg:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#12372A] shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Categories Radio Filter */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-2xs space-y-3">
              <h3 className="font-serif font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">
                Categories
              </h3>
              <div className="space-y-2 text-xs">
                {CATEGORIES.map((cat) => {
                  const isChecked = selectedCategory === cat.name;
                  return (
                    <label
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setMobileFilterOpen(false);
                      }}
                      className="flex items-center gap-2.5 cursor-pointer text-stone-700 hover:text-[#12372A] py-0.5 select-none"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={isChecked}
                        onChange={() => setSelectedCategory(cat.name)}
                        className="w-4 h-4 text-[#12372A] focus:ring-[#12372A] accent-[#12372A] border-stone-300"
                      />
                      <span className={isChecked ? 'font-bold text-[#12372A]' : 'font-medium'}>
                        {cat.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Range Radio Filter */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-2xs space-y-3">
              <h3 className="font-serif font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">
                Price Range
              </h3>
              <div className="space-y-2 text-xs">
                {pricePresets.map((preset) => {
                  const isChecked = priceRange === preset.id;
                  return (
                    <label
                      key={preset.id}
                      onClick={() => {
                        setPriceRange(preset.id);
                        setMobileFilterOpen(false);
                      }}
                      className="flex items-center gap-2.5 cursor-pointer text-stone-700 hover:text-[#12372A] py-0.5 select-none"
                    >
                      <input
                        type="radio"
                        name="priceRange"
                        checked={isChecked}
                        onChange={() => setPriceRange(preset.id)}
                        className="w-4 h-4 text-[#12372A] focus:ring-[#12372A] accent-[#12372A] border-stone-300"
                      />
                      <span className={isChecked ? 'font-bold text-[#12372A]' : 'font-medium'}>
                        {preset.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="w-full py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}

          </aside>

          {/* RIGHT PRODUCTS GRID (9 cols on lg) */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Top Bar with Sort Dropdown */}
            <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-200/60">
              <p className="text-stone-500 font-medium">
                Showing <strong className="text-stone-900">{filteredProducts.length}</strong> items
              </p>

              <div className="flex items-center gap-2">
                <span className="text-stone-500 hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="py-1.5 px-2.5 rounded-lg bg-white border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#12372A]"
                >
                  <option value="popular">Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating-desc">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Products Grid: 4 in each row on desktop, 2 on tablet, 2 on mobile */}
            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-stone-200 p-8 space-y-3">
                <p className="font-serif font-bold text-lg text-[#12372A]">
                  No products found
                </p>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Try adjusting your category or price filters to find authentic Kerala spices.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-full bg-[#12372A] text-white text-xs font-bold uppercase tracking-wider"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5 lg:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination (matching reference Screen 2) */}
            {filteredProducts.length > 0 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-stone-200 text-stone-600 flex items-center justify-center text-xs hover:bg-stone-50"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  className="w-8 h-8 rounded-lg bg-[#12372A] text-white font-bold text-xs flex items-center justify-center shadow-xs"
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(2)}
                  className="w-8 h-8 rounded-lg bg-white border border-stone-200 text-stone-700 font-semibold text-xs flex items-center justify-center hover:bg-stone-50"
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(3)}
                  className="w-8 h-8 rounded-lg bg-white border border-stone-200 text-stone-700 font-semibold text-xs flex items-center justify-center hover:bg-stone-50"
                >
                  3
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(4)}
                  className="w-8 h-8 rounded-lg bg-white border border-stone-200 text-stone-700 font-semibold text-xs flex items-center justify-center hover:bg-stone-50"
                >
                  4
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-stone-200 text-stone-600 flex items-center justify-center text-xs hover:bg-stone-50"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </main>

        </div>
      </div>

    </div>
  );
};
