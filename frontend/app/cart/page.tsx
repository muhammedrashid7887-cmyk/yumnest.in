import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { CartPageContent } from '@/components/cart/CartPageContent';

export const metadata: Metadata = {
  title: 'Your Spice Basket & Cart | Yumnest Foods Kerala',
  description:
    'Review your selected authentic Kerala spices and broast powders, check quantities, calculate shipping, and submit your order directly via WhatsApp to Yumnest.',
};

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917]">
      <Navbar />
      <main className="flex-1">
        <CartPageContent />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
