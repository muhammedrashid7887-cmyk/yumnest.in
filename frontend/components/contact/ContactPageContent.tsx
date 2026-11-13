'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from 'lucide-react';
import { SITE_SETTINGS } from '@/data/mockData';
import {
  WhatsAppIcon,
  InstagramIcon,
  FacebookIcon,
  LinkedInIcon,
  XIcon,
} from '@/components/common/BrandMediaIcons';

export const ContactPageContent: React.FC = () => {
  const whatsappCleanNumber = SITE_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '');

  // Quick WhatsApp Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = `🌿 *New Inquiry for Yumnest Spices*
👤 *Name:* ${fullName.trim() || 'Customer'}
📞 *Phone:* ${phone.trim() || 'Not provided'}
💬 *Message:* ${message.trim() || 'Hello Yumnest! I would like more details about your spices and orders.'}`;

    const url = `https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent(formatted)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="py-10 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Two-Column Layout matching Reference UI */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-center">
          {/* ── Left Column: Contact Details & Brand Info ── */}
          <div className="lg:col-span-5 space-y-6 text-left">
            {/* Eyebrow Label */}
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.25em] text-[#9E7326] uppercase">
              Contact Yumnest
            </p>

            {/* Main Heading */}
            <h1 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-bold text-[#0F5638] leading-tight tracking-tight">
              Get in Touch With Us
            </h1>

            {/* Introduction Description */}
            <p className="text-stone-600 text-xs sm:text-sm md:text-[15px] lg:text-base leading-relaxed font-normal">
              Have questions or need assistance? We&apos;re here to help! Contact us for product enquiries, order details, bulk purchases, or any other information. Our friendly team is always ready to assist you and provide the support you need.
            </p>

            {/* Company Name */}
            <div className="text-base sm:text-lg font-bold text-[#0F5638] tracking-wide pt-1">
              YUMNEST SPICES &amp; FOODS
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

            {/* Social & Messaging Icons */}
            <div className="pt-2">
              <div className="flex items-center gap-3 sm:gap-3.5 flex-wrap">
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent('🌿 Hello Yumnest! I would like to know more about your traditional spices and delivery options. 😊')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat on WhatsApp"
                  title="WhatsApp"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:scale-95 cursor-pointer"
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
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] text-white flex items-center justify-center shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:scale-95 cursor-pointer"
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
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:scale-95 cursor-pointer"
                >
                  <FacebookIcon className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
                </a>

                {/* LinkedIn */}
                <a
                  href={SITE_SETTINGS.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Connect on LinkedIn"
                  title="LinkedIn"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0A66C2] hover:bg-[#095196] text-white flex items-center justify-center shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:scale-95 cursor-pointer"
                >
                  <LinkedInIcon className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
                </a>

                {/* X */}
                <a
                  href={SITE_SETTINGS.xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on X"
                  title="X"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black hover:bg-stone-800 text-white flex items-center justify-center shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:scale-95 cursor-pointer border border-stone-800"
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
              />
            </div>
          </div>
        </div>

        {/* ── WhatsApp Form Section (venamilkil oru whatsapp form) ── */}
        <div className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-stone-200">
          <div className="max-w-2xl mx-auto bg-[#FAF7F0] border border-[#E8DFC8] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/60">
                <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Instant WhatsApp Support</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F5638]">
                Send Us a Direct Message
              </h2>
              <p className="text-xs sm:text-sm text-stone-600">
                Type your message below to start a direct chat with our team on WhatsApp.
              </p>
            </div>

            <form onSubmit={handleSendWhatsApp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact-form-name" className="text-xs font-semibold text-stone-700">
                    Your Name
                  </label>
                  <input
                    id="contact-form-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-form-phone" className="text-xs font-semibold text-stone-700">
                    Phone Number
                  </label>
                  <input
                    id="contact-form-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-form-message" className="text-xs font-semibold text-stone-700">
                  Message
                </label>
                <textarea
                  id="contact-form-message"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you? (Product queries, bulk orders, feedback, etc.)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition resize-y"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
