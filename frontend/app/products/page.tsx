import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { ProductsCatalog } from '@/components/products/ProductsCatalog';

import { buildPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/schemas';

type Props = {
  searchParams: Promise<{ category?: string; search?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const resolved = await searchParams;
  const category = resolved?.category;

  if (category && category !== 'All Products' && category !== 'cat-all') {
    return buildPageMetadata({
      title: `${category} Collection - Authentic Kerala Spices`,
      description: `Shop authentic ${category} crafted with pure spices from Kerala estates. Restaurant-style quality delivered fresh across India by Yum Nest.`,
      path: `/products?category=${encodeURIComponent(category)}`,
      keywords: [
        category,
        `${category} Kerala`,
        'Yum Nest Spices',
        'Pure Kerala Spices',
        'Buy Spices Online',
      ],
    });
  }

  return buildPageMetadata({
    title: 'Pure Kerala Spices, Broast Powders & Masalas | Products Collection',
    description:
      'Browse the full Yum Nest catalogue of authentic single-estate Kerala spices, crispy restaurant-style broast masala powder, Alfaham mix, 100% pure roasted copra coconut oil, and handpicked Tellicherry pepper. Delivered fresh across India.',
    path: '/products',
    keywords: [
      'Kerala Spices',
      'Broast Masala Powder',
      'Alfaham Masala',
      'Tellicherry Pepper',
      'Idukki Cardamom',
      'Pure Coconut Oil',
      'Yum Nest Products',
      'Buy Kerala Spices Online',
    ],
  });
}

function ProductsLoadingSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Top Header skeleton (pure white) */}
      <div className="bg-white border-b border-stone-200/90 py-6 px-4">
        <div className="max-w-7xl xl:max-w-[1440px] mx-auto animate-pulse space-y-3">
          <div className="h-4 bg-stone-100 rounded w-28" />
          <div className="h-8 bg-stone-200 rounded-lg w-52" />
          <div className="h-4 bg-stone-100 rounded max-w-sm" />
        </div>
      </div>
      {/* Product grid skeleton (#EAE0E0 background) */}
      <div className="bg-[#EAE0E0] py-8 px-4">
        <div className="max-w-7xl xl:max-w-[1440px] mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-80 bg-white rounded-2xl animate-pulse shadow-xs border border-[#E8DFC8]/60" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function ProductsPage({ searchParams }: Props) {
  const resolved = await searchParams;
  const category = resolved?.category;

  const breadcrumb = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Products', url: category ? '/products' : undefined },
    ...(category && category !== 'All Products' && category !== 'cat-all'
      ? [{ name: category }]
      : []),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1C1917]">
      <JsonLd data={breadcrumb} />
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<ProductsLoadingSkeleton />}>
          <ProductsCatalog />
        </Suspense>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
