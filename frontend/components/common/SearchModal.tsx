'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { Search, X, Star, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct?: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.shortDescription.toLowerCase().includes(query.toLowerCase()) ||
          p.ingredients.some((ing) => ing.toLowerCase().includes(query.toLowerCase()))
      )
    : products.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" 
      />

      <div className="min-h-full flex items-start justify-center p-4 pt-20 sm:pt-24 text-center">
        <div className="relative w-full max-w-2xl bg-[#FBF9F5] rounded-3xl overflow-hidden shadow-2xl border border-[#E8DFC8] text-left animate-in zoom-in-95 duration-200">
          
          {/* Search Header Input */}
          <div className="p-4 sm:p-5 border-b border-[#E8DFC8] flex items-center gap-3 bg-white">
            <Search className="w-5 h-5 text-stone-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for Broast Masala, Cardamom, Pepper, Coconut oil..."
              className="w-full bg-transparent text-sm sm:text-base font-medium text-stone-800 placeholder-stone-400 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              {query ? `Search Results (${results.length})` : 'Popular Spices & Blends'}
            </p>

            {results.length === 0 ? (
              <div className="text-center py-10 text-stone-500">
                <p className="font-semibold text-sm">No spices found matching &quot;{query}&quot;.</p>
                <p className="text-xs text-stone-400 mt-1">
                  Try searching for &quot;Broast&quot;, &quot;Cardamom&quot;, &quot;Pepper&quot;, or &quot;Oil&quot;.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((product) => {
                  const baseVariant = product.variants[0];
                  const price = baseVariant.salePrice || baseVariant.price;
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      onClick={onClose}
                      className="group flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E8DFC8] hover:border-[#12372A] hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={product.primaryImage}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-serif font-bold text-sm text-[#1C1917] group-hover:text-[#12372A] truncate transition-colors">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-stone-500">
                            <span>{product.category}</span>
                            <span>•</span>
                            <span className="font-bold text-[#12372A]">
                              ₹{price} ({baseVariant.weight})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pl-3">
                        <span className="text-xs text-amber-500 flex items-center gap-0.5">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="font-bold text-stone-700">{product.rating}</span>
                        </span>
                        <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#12372A] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-3.5 sm:p-4 bg-white border-t border-[#E8DFC8] flex items-center justify-between text-xs">
            <span className="text-stone-400 text-[11px] hidden sm:inline">Press ESC to close</span>
            <Link
              href="/products"
              onClick={onClose}
              className="font-bold text-[#12372A] hover:underline flex items-center gap-1.5 ml-auto"
            >
              <span>Explore All Authentic Spices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
