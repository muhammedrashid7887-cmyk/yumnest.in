'use client';

import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { SITE_SETTINGS } from '@/data/mockData';
import {
  WhatsAppIcon,
  InstagramIcon,
  FacebookIcon,
  LinkedInIcon,
  XIcon,
} from '@/components/common/BrandMediaIcons';

export const CtaBanner: React.FC = () => {
  const whatsappCleanNumber = SITE_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <section id="contact" className="py-10 sm:py-20 lg:py-24 bg-white border-t border-stone-200 reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Two-Column Layout on Desktop / Stacked on Mobile & Tablet */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-center">

          {/* ── Left Column: Contact Details & Brand Info ── */}
          <div className="lg:col-span-5 space-y-6 text-left">

            {/* Eyebrow Label */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-bold uppercase tracking-wider border border-stone-200">
              <Mail className="w-3.5 h-3.5 text-[#0F5638]" />
              <span>Contact Yumnest</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-bold text-[#0F5638] leading-tight tracking-tight">
              Get in Touch With Us
            </h2>

            {/* Introduction Description */}
            <p className="text-stone-600 text-xs sm:text-sm md:text-[15px] lg:text-base leading-relaxed font-normal">
              Have questions or need assistance? We&apos;re here to help! Contact us for product enquiries, order details, bulk purchases, or any other information. Our friendly team is always ready to assist you and provide the support you need.
            </p>

            {/* Company Name */}
            <div className="text-base sm:text-lg font-bold text-[#0F5638] tracking-wide pt-1">
              YUMNEST SPICES & FOODS
            </div>

            {/* Contact Details List */}
            <div className="space-y-4 pt-1">

              {/* Address */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#0F5638]/10 text-[#0F5638] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-[13px] sm:text-xs font-bold uppercase tracking-wider text-stone-500">
                    Address:
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-700 leading-snug font-normal">
                    Thoppumpady, Kochi – 5
                    <br />
                    Ernakulam, Kerala, India
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#0F5638]/10 text-[#0F5638] flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-[13px] sm:text-xs font-bold uppercase tracking-wider text-stone-500">
                    Phone:
                  </h4>
                  <a
                    href="tel:+917012268934"
                    className="text-xs sm:text-sm font-semibold text-stone-800 hover:text-[#0F5638] transition-colors"
                  >
                    +91 70122 68934
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#0F5638]/10 text-[#0F5638] flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-[13px] sm:text-xs font-bold uppercase tracking-wider text-stone-500">
                    Email:
                  </h4>
                  <a
                    href="mailto:yumnest2000@gmail.com"
                    className="text-xs sm:text-sm font-semibold text-stone-800 hover:text-[#0F5638] transition-colors"
                  >
                    yumnest2000@gmail.com
                  </a>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#0F5638]/10 text-[#0F5638] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-[13px] sm:text-xs font-bold uppercase tracking-wider text-stone-500">
                    Business Hours:
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-700 leading-snug font-normal">
                    Monday – Saturday | 9:00 AM – 7:00 PM IST
                  </p>
                </div>
              </div>

            </div>

            {/* Social & Messaging Icons (WhatsApp, Instagram, Facebook, LinkedIn, X - Icon Only) */}
            <div className="pt-2">
              <div className="flex items-center gap-3 sm:gap-3.5 flex-wrap">
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent('🌿 Hello Yumnest! I would like to know more about your traditional spices and delivery options. 😊')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat on WhatsApp"
                  title="WhatsApp"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95 cursor-pointer"
                >
                  <WhatsAppIcon className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
                </a>

                {/* Instagram */}
                <a
                  href={SITE_SETTINGS.instagramUrl || 'https://instagram.com/yumnest.in'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                  title="Instagram"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] text-white flex items-center justify-center shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95 cursor-pointer"
                >
                  <InstagramIcon className="w-5 h-5 sm:w-6 sm:h-6 stroke-white" />
                </a>

                {/* Facebook */}
                <a
                  href={SITE_SETTINGS.facebookUrl || 'https://facebook.com/yumnest'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Connect on Facebook"
                  title="Facebook"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95 cursor-pointer"
                >
                  <FacebookIcon className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com/company/yumnest"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Connect on LinkedIn"
                  title="LinkedIn"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0A66C2] hover:bg-[#095196] text-white flex items-center justify-center shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95 cursor-pointer"
                >
                  <LinkedInIcon className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
                </a>

                {/* X (formerly Twitter) */}
                <a
                  href="https://x.com/yumnest"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on X"
                  title="X"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black hover:bg-stone-800 text-white flex items-center justify-center shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95 cursor-pointer border border-stone-800"
                >
                  <XIcon className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                </a>
              </div>
            </div>

          </div>

          {/* ── Right Column: WhatsApp Contact Image ── */}
          <div className="lg:col-span-7 w-full flex items-center justify-center">
            <div className="relative w-full max-w-[500px] sm:max-w-[520px] lg:max-w-[540px] flex items-center justify-center">
              <img
                src="/assets/contact-whatsapp.jpg"
                alt="Connect with Yumnest on WhatsApp"
                loading="lazy"
                className="w-full h-auto object-contain rounded-2xl sm:rounded-3xl border border-stone-200 shadow-xs"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
