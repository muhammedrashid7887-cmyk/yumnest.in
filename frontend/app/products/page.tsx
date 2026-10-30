import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { ProductsCatalog } from '@/components/products/ProductsCatalog';

export const metadata: Metadata = {
  title: 'Pure Kerala Spices & Broast Powders | Yumnest Products Collection',
  description:
    'Browse our curated collection of authentic single-estate Kerala spices, crispy broast masala powder, 100% pure roasted copra coconut oil, Tellicherry pepper, and gift boxes. Delivered fresh all across India.',
  keywords: [
    'Kerala Spices',
    'Broast Masala Powder',
    'Tellicherry Pepper',
    'Idukki Cardamom',
    'Pure Turmeric',
    'Pure Coconut Oil',
    'Yumnest Products',
  ],
};

function ProductsLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] py-16 px-4 max-w-7xl mx-auto">
      <div className="animate-pulse space-y-8">
        <div className="h-10 bg-stone-200 rounded-xl w-64" />
        <div className="h-12 bg-stone-200 rounded-xl max-w-md" />
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-80 bg-stone-200 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917]">
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
