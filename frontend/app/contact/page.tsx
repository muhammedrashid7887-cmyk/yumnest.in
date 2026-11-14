import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { WhatsAppFloat } from '@/components/common/WhatsAppFloat';
import { ContactPageContent } from '@/components/contact/ContactPageContent';

import { buildPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact Us & Wholesale Distribution | Kochi, Kerala',
  description:
    'Contact Yum Nest Spices & Foods in Thoppumpady, Kochi. Inquire about retail orders, restaurant supply, and wholesale spice distribution across India. Phone: +91 70122 68934.',
  path: '/contact',
  keywords: [
    'Contact Yum Nest',
    'Wholesale Spices Kerala',
    'Broast Masala Distribution',
    'Yum Nest Kochi Office',
    'Spice Supplier Kerala',
  ],
});

export default function ContactPage() {
  const breadcrumb = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Contact Us' },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#1C1917] selection:bg-[#E8AA42]/30 selection:text-[#0F5638]">
      <JsonLd data={breadcrumb} />
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
