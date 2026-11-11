import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { WhatsAppFloat } from '@/components/common/WhatsAppFloat';
import { SITE_SETTINGS } from '@/data/mockData';
import { Phone, Mail, MapPin, Clock, MessageSquare, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | Yumnest Foods & Pure Spices',
  description:
    'Get in touch with Yumnest Customer Care. Connect via WhatsApp, phone, or visit our spice manufacturing unit in Aluva, Ernakulam, Kerala.',
};

export default function ContactPage() {
  const whatsappCleanNumber = SITE_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917] selection:bg-[#E8AA42]/30 selection:text-[#0F5638]">
      <Navbar />

      <main className="flex-1 pb-16 lg:pb-0">
        {/* Hero Header */}
        <section className="py-10 sm:py-14 bg-gradient-to-b from-[#F5EFE6] to-[#FBF9F5] border-b border-[#E8DFC8]">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0F5638]">
              Customer Support &amp; Distribution
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0F5638] tracking-tight">
              Get in Touch with Yum Nest
            </h1>
            <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
              Have questions about our single-estate spices, bulk wholesale pricing, or looking for culinary tips? We are here to help.
            </p>
          </div>
        </section>

        {/* Contact Cards Grid */}
        <section className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Phone & WhatsApp Card */}
            <div className="bg-white rounded-2xl border border-[#E8DFC8] p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0F5638] flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </div>
                <h2 className="font-bold text-lg text-stone-900">Phone &amp; WhatsApp</h2>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Call us directly or message our team on WhatsApp for instant spice orders and fulfillment tracking.
                </p>
                <div className="pt-2 text-sm font-semibold text-[#0F5638]">
                  <p>{SITE_SETTINGS.supportPhone}</p>
                </div>
              </div>
              <a
                href={`https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent('🌿 Hello Yumnest! I would like to enquire about your products.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Email & Wholesale Card */}
            <div className="bg-white rounded-2xl border border-[#E8DFC8] p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <h2 className="font-bold text-lg text-stone-900">Email Enquiries</h2>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Send your business queries, institutional purchase inquiries, or customer feedback directly to our inbox.
                </p>
                <div className="pt-2 text-sm font-semibold text-stone-800">
                  <p>{SITE_SETTINGS.supportEmail}</p>
                </div>
              </div>
              <a
                href={`mailto:${SITE_SETTINGS.supportEmail}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition border border-stone-200"
              >
                <Mail className="w-4 h-4" />
                <span>Send Email</span>
              </a>
            </div>

            {/* Address & Hours Card */}
            <div className="bg-white rounded-2xl border border-[#E8DFC8] p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0F5638] flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <h2 className="font-bold text-lg text-stone-900">Manufacturing Unit</h2>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {SITE_SETTINGS.address}
                </p>
                <div className="flex items-center gap-2 text-xs text-stone-500 pt-1">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Mon - Sat: 9:00 AM - 6:30 PM IST</span>
                </div>
              </div>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-stone-500 block">
                  All-India Shipping with Tracking
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
      <WhatsAppFloat />
    </div>
  );
}
