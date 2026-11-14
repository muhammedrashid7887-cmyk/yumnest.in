import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { WhatsAppFloat } from '@/components/common/WhatsAppFloat';
import { getStorefrontCategories } from '@/lib/api/storefront';
import { ArrowRight, Layers } from 'lucide-react';

import { buildPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Spice Categories & Masala Collections | Buy Online',
  description:
    'Browse Yum Nest mastercrafted collections of authentic Kerala ground masalas, crispy broast powders, whole estate spices, and 100% roasted copra coconut oil.',
  path: '/categories',
  keywords: [
    'Kerala Spice Categories',
    'Broast Masala Collection',
    'Buy Masala Powders Online',
    'Kerala Coconut Oil Online',
    'Authentic Spice Blends',
  ],
});

export default async function CategoriesPage() {
  const categories = await getStorefrontCategories();
  const breadcrumb = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Categories' },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#1C1917] selection:bg-[#E8AA42]/30 selection:text-[#0F5638]">
      <JsonLd data={breadcrumb} />
      <Navbar />

      <main className="flex-1 pb-16 lg:pb-0">
        {/* Hero Header */}
        <section className="py-10 sm:py-14 bg-gradient-to-b from-[#F5EFE6] to-[#FAF7F0] border-b border-[#E8DFC8]">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0F5638]">
              Catalogue Taxonomies
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0F5638] tracking-tight">
              Spice &amp; Food Categories
            </h1>
            <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
              Browse our mastercrafted collections of authentic Kerala ground masalas, whole estate spices, and cold-pressed copra oil.
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {categories.map((cat) => {
              const categoryParam = cat.id === 'cat-all' ? '' : encodeURIComponent(cat.name);
              const href = categoryParam ? `/products?category=${categoryParam}` : '/products';

              return (
                <Link
                  key={cat.id}
                  href={href}
                  className="group block bg-white rounded-2xl border border-[#E8DFC8] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  {cat.image ? (
                    <div className="w-full h-48 overflow-hidden bg-stone-100 relative">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                      {cat.malayalamName && (
                        <span className="absolute bottom-3 left-4 text-xs font-bold text-white tracking-wide bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md">
                          {cat.malayalamName}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-emerald-50/60 flex items-center justify-center text-[#0F5638]">
                      <Layers className="w-12 h-12 opacity-40" />
                    </div>
                  )}

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h2 className="font-extrabold text-lg text-stone-900 group-hover:text-[#0F5638] transition-colors">
                        {cat.name}
                      </h2>
                      <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#0F5638] group-hover:translate-x-1 transition-all" />
                    </div>
                    {cat.description && (
                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
      <WhatsAppFloat />
    </div>
  );
}
