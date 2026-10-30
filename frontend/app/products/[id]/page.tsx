import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PRODUCTS } from '@/data/mockData';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { ProductDetailView } from '@/components/products/ProductDetailView';
import { AlertCircle, ArrowLeft } from 'lucide-react';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return {
      title: 'Product Not Found | Yumnest Foods & Pure Spices',
      description: 'The requested spice product could not be found.',
    };
  }

  return {
    title: `${product.name} | Yumnest Kerala Pure Spices`,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} | Yumnest Foods`,
      description: product.shortDescription,
      images: [
        {
          url: product.primaryImage,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
  };
}

function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="h-4 bg-stone-200 rounded w-48 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square bg-stone-200 rounded-3xl" />
          <div className="flex gap-3">
            <div className="w-20 h-20 bg-stone-200 rounded-2xl" />
            <div className="w-20 h-20 bg-stone-200 rounded-2xl" />
          </div>
        </div>
        <div className="lg:col-span-7 space-y-5">
          <div className="h-6 bg-stone-200 rounded w-32" />
          <div className="h-10 bg-stone-200 rounded w-3/4" />
          <div className="h-4 bg-stone-200 rounded w-40" />
          <div className="h-20 bg-stone-200 rounded-2xl w-full" />
          <div className="grid grid-cols-4 gap-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-stone-200 rounded-2xl" />
            ))}
          </div>
          <div className="h-14 bg-stone-200 rounded-2xl w-full mt-4" />
        </div>
      </div>
    </div>
  );
}

async function ProductDetailContent({ params }: Props) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="flex items-center justify-center p-6 sm:p-12 min-h-[50vh]">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E8DFC8] p-8 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="font-serif font-bold text-2xl text-[#12372A]">
            Spice Not Found
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed">
            We couldn&apos;t find a spice or food product with the identifier &ldquo;{id}&rdquo;. It may have been discontinued or moved.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#12372A] hover:bg-[#1A4D3B] text-white text-xs font-bold uppercase tracking-wider shadow transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to All Spices</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ProductDetailView product={product} />;
}

export default function ProductDetailPage({ params }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917]">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductDetailContent params={params} />
        </Suspense>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
