import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { ArrowLeft, Home, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page Not Found | Yum Nest',
  description: 'The page you are looking for does not exist or has been moved.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#1C1917]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-stone-200/80 shadow-md">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-[#0F5638] flex items-center justify-center font-bold text-2xl font-serif">
            404
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F5638] tracking-tight">
              Page Not Found
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
              The product, category, or page you were looking for cannot be found. It may have been renamed or discontinued.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Explore Spices</span>
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Go Home</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
