'use client';

import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { SITE_SETTINGS } from '@/data/mockData';

export const CtaBanner: React.FC = () => {
  const whatsappCleanNumber = SITE_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <section id="contact" className="py-10 sm:py-20 lg:py-24 bg-[#FBF9F5] border-t border-[#E8DFC8]/70 reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


        {/* Two-Column Layout on Desktop / Stacked on Mobile & Tablet */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-center">

          {/* ── Left Column: Contact Details & Brand Info ── */}
          <div className="lg:col-span-5 space-y-6 text-left">

            {/* Eyebrow Label */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8AA42]/15 text-[#9E7326] text-xs font-bold uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5 text-[#E8AA42]" />
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

            {/* Small WhatsApp Quick Contact Button */}
            <div className="pt-2">
              <a
                href={`https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent('🌿 Hello Yumnest! I would like to know more about your traditional spices and delivery options. 😊')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all active:scale-95"
              >
                <img src="/assets/whatsapp-icon.png" alt="WhatsApp" className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

          </div>

          {/* ── Right Column: WhatsApp Contact Image ── */}
          <div className="lg:col-span-7 w-full flex items-center justify-center">
            <div className="relative w-full max-w-[500px] sm:max-w-[520px] lg:max-w-[540px] flex items-center justify-center">
              <img
                src="/assets/contact-whatsapp.jpg"
                alt="Connect with Yumnest on WhatsApp"
                loading="lazy"
                className="w-full h-auto object-contain rounded-2xl sm:rounded-3xl border border-[#E8DFC8] shadow-xs"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
