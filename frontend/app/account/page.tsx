import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { AccountOrdersContent } from '@/components/account/AccountOrdersContent';

export const metadata: Metadata = {
  title: 'My Account & Order Status | Yumnest Foods Kerala',
  description:
    'View your customer account, order history, and track real-time delivery progress for authentic Kerala spices and broast powders from Yumnest.',
};

export default function AccountPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917]">
      <Navbar />
      <main className="flex-1 pb-16 lg:pb-0">
        <AccountOrdersContent />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
