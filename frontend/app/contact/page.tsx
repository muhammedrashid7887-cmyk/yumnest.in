import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { WhatsAppFloat } from '@/components/common/WhatsAppFloat';
import { ContactPageContent } from '@/components/contact/ContactPageContent';

export const metadata: Metadata = {
  title: 'Contact Us | Yumnest Spices & Foods Kochi',
  description:
    'Get in touch with YUMNEST SPICES & FOODS. Connect via WhatsApp (+91 70122 68934), email (yumnest2000@gmail.com), or visit our registered office in Thoppumpady, Kochi – 5, Ernakulam, Kerala, India.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#1C1917] selection:bg-[#E8AA42]/30 selection:text-[#0F5638]">
      <Navbar />

      <main className="flex-1">
        <ContactPageContent />
      </main>

      <Footer />
      <MobileBottomNav />
      <WhatsAppFloat />
    </div>
  );
}
