'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { CATEGORIES } from '@/data/mockData';
import { Product, CategoryItem } from '@/types';
import { getStorefrontProducts, getStorefrontCategories } from '@/lib/api/storefront';
import { useSocketEvent } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/lib/socket/events';
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

interface ProductsCatalogProps {
  initialProducts?: Product[];
  initialCategories?: CategoryItem[];
}

export const ProductsCatalog: React.FC<ProductsCatalogProps> = ({
  initialProducts,
  initialCategories,
}) => {
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts || []);
  const [allCategories, setAllCategories] = useState<CategoryItem[]>(initialCategories || CATEGORIES);

  const refreshCatalog = useCallback(() => {
    Promise.all([getStorefrontProducts({ limit: 100 }), getStorefrontCategories()])
      .then(([{ products: liveProds }, liveCats]) => {
        if (Array.isArray(liveProds)) setAllProducts(liveProds);
        if (Array.isArray(liveCats)) setAllCategories(liveCats);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshCatalog();
  }, [refreshCatalog]);

  // Real-time Socket.IO: update catalog immediately without refresh
  useSocketEvent(SOCKET_EVENTS.PRODUCT_CREATED, refreshCatalog);
  useSocketEvent(SOCKET_EVENTS.PRODUCT_UPDATED, refreshCatalog);
  useSocketEvent(SOCKET_EVENTS.PRODUCT_DELETED, (payload?: { id?: string }) => {
    if (payload?.id) {
      setAllProducts((prev) => prev.filter((p) => p.id !== payload.id && p._id !== payload.id));
    }
    refreshCatalog();
  });
  useSocketEvent(SOCKET_EVENTS.PRODUCT_STOCK_UPDATED, refreshCatalog);
  useSocketEvent(SOCKET_EVENTS.CATEGORY_CREATED, refreshCatalog);
  useSocketEvent(SOCKET_EVENTS.CATEGORY_UPDATED, refreshCatalog);
  useSocketEvent(SOCKET_EVENTS.CATEGORY_DELETED, refreshCatalog);

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

  const ITEMS_PER_PAGE = 8;

  // Reset to page 1 whenever filters change
  useEffect(() => {
    queueMicrotask(() => setCurrentPage(1));
  }, [selectedCategory, searchQuery, priceRange, sortBy]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
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
  }, [selectedCategory, searchQuery, priceRange, sortBy, allProducts]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const paginatedProducts = useMemo(() => {
    const start = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, validCurrentPage]);

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
    <div className="reveal-on-scroll">
      
      {/* 1. Header Section - Pure White (as requested: "last image il ulla section white thanne mathee") */}
      <section className="bg-white border-b border-stone-200/90 shadow-2xs">
        <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-8 pt-5 sm:pt-7 pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <nav className="text-xs text-stone-500 mb-1 flex items-center gap-1.5" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-[#0F5638] transition-colors">Home</Link>
                <span>/</span>
                <span className="text-stone-400">Products</span>
                {selectedCategory !== 'All Products' && (
                  <>
                    <span>/</span>
                    <span className="text-[#0F5638] font-semibold">{selectedCategory}</span>
                  </>
                )}
              </nav>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F5638] tracking-tight leading-tight">
                {selectedCategory === 'All Products' ? 'All Products' : selectedCategory}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 font-normal sm:text-right">
              Explore authentic Kerala spices, pure masalas &amp; single-estate blends
            </p>
          </div>

          {/* Mobile Search & Filter Bar (Kept inside the White Header Section) */}
          <div className="lg:hidden flex items-center justify-between gap-2.5 pt-3.5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search products..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold text-[#0F5638] flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters {hasActiveFilters && '•'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Main Catalog Section - Styled with #EAE0E0 background (as requested: "ithinte main bg color ith aakkaam") */}
      <section className="bg-[#EAE0E0] min-h-[calc(100vh-220px)] py-5 sm:py-8 pb-16">
        <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
            
            {/* LEFT SIDEBAR (Desktop always visible, Mobile collapsible) */}
            <aside className={`lg:col-span-3 space-y-5 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
              
              {/* Search Input (Desktop) */}
              <div className="hidden lg:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#0F5638] shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Categories Radio Filter */}
              <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-2xs space-y-3">
                <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-2">
                  Categories
                </h3>
                <div className="space-y-2 text-xs">
                  {allCategories.map((cat) => {
                    const isChecked = selectedCategory === cat.name;
                    return (
                      <label
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          setCurrentPage(1);
                          setMobileFilterOpen(false);
                        }}
                        className="flex items-center gap-2.5 cursor-pointer text-stone-700 hover:text-[#0F5638] py-0.5 select-none"
                      >
                        <input
                          type="radio"
                          name="category"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedCategory(cat.name);
                            setCurrentPage(1);
                          }}
                          className="w-4 h-4 text-[#0F5638] focus:ring-[#0F5638] accent-[#0F5638] border-stone-300 cursor-pointer"
                        />
                        <span className={isChecked ? 'font-bold text-[#0F5638]' : 'font-medium'}>
                          {cat.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Radio Filter */}
              <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-2xs space-y-3">
                <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-2">
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
                          setCurrentPage(1);
                          setMobileFilterOpen(false);
                        }}
                        className="flex items-center gap-2.5 cursor-pointer text-stone-700 hover:text-[#0F5638] py-0.5 select-none"
                      >
                        <input
                          type="radio"
                          name="priceRange"
                          checked={isChecked}
                          onChange={() => {
                            setPriceRange(preset.id);
                            setCurrentPage(1);
                          }}
                          className="w-4 h-4 text-[#0F5638] focus:ring-[#0F5638] accent-[#0F5638] border-stone-300 cursor-pointer"
                        />
                        <span className={isChecked ? 'font-bold text-[#0F5638]' : 'font-medium'}>
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
                  className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              )}

            </aside>

            {/* RIGHT PRODUCTS GRID (9 cols on lg) */}
            <main className="lg:col-span-9 space-y-5">
              
              {/* Top Bar with Sort Dropdown */}
              <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-300/60">
                <p className="text-stone-600 font-medium">
                  Showing <strong className="text-stone-900">{filteredProducts.length}</strong> items
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-stone-600 hidden sm:inline">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="py-1.5 px-2.5 rounded-lg bg-white border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#0F5638] shadow-2xs cursor-pointer"
                  >
                    <option value="popular">Popular</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating-desc">Highest Rated</option>
                  </select>
                </div>
              </div>

              {/* Products Grid: 3-4 in each row on desktop, 2 on tablet, 2 on mobile with enlarged card width */}
              {filteredProducts.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-stone-200/90 p-8 space-y-3 shadow-2xs">
                  <p className="font-bold text-base sm:text-lg text-[#0F5638] leading-snug">
                    No products found
                  </p>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Try adjusting your category or price filters to find authentic Kerala spices.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 rounded-full bg-[#0F5638] text-white text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#0c442c] transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3.5 pt-1 pb-2">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {/* Dynamic Pagination - only shown when totalPages > 1 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={validCurrentPage === 1}
                    className="w-9 h-9 rounded-xl bg-white border border-stone-200 text-stone-600 flex items-center justify-center text-xs hover:bg-stone-50 disabled:opacity-35 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                        pageNum === validCurrentPage
                          ? 'bg-[#0F5638] text-white scale-105 shadow-sm'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={validCurrentPage === totalPages}
                    className="w-9 h-9 rounded-xl bg-white border border-stone-200 text-stone-600 flex items-center justify-center text-xs hover:bg-stone-50 disabled:opacity-35 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </main>

          </div>
        </div>
      </section>

    </div>
  );
};
