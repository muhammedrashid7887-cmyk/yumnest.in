'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import { SITE_SETTINGS } from '@/data/mockData';

export const CtaBanner: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const whatsappCleanNumber = SITE_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate swift submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        message: '',
      });
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 600);
  };

  return (
    <section id="contact" className="py-8 sm:py-20 lg:py-24 bg-[#FBF9F5] border-t border-[#E8DFC8]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Two-Column Layout on Desktop / Stacked on Mobile & Tablet */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-14 items-start">
          
          {/* ── Left Column: Contact Details & Brand Info ── */}
          <div className="lg:col-span-5 space-y-6 text-left">
            
            {/* Eyebrow Label */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8AA42]/15 text-[#9E7326] text-xs font-bold uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5 text-[#E8AA42]" />
              <span>Contact Yumnest</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-serif font-bold text-[#12372A] leading-tight">
              Get in Touch With Us
            </h2>

            {/* Welcoming Description */}
            <p className="text-stone-600 text-xs sm:text-sm md:text-[15px] leading-relaxed">
              Have questions about our authentic Kerala spices, single-estate harvests, or need bulk order assistance? Reach out to our team — we are always delighted to help.
            </p>

            {/* Contact Details List */}
            <div className="space-y-4 pt-2">
              
              {/* Email */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#12372A]/10 text-[#12372A] flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Email Address
                  </h4>
                  <a
                    href={`mailto:${SITE_SETTINGS.supportEmail}`}
                    className="text-xs sm:text-sm font-semibold text-stone-800 hover:text-[#12372A] transition-colors"
                  >
                    {SITE_SETTINGS.supportEmail}
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#12372A]/10 text-[#12372A] flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Phone Number
                  </h4>
                  <a
                    href={`tel:${SITE_SETTINGS.supportPhone.replace(/\s+/g, '')}`}
                    className="text-xs sm:text-sm font-semibold text-stone-800 hover:text-[#12372A] transition-colors"
                  >
                    {SITE_SETTINGS.supportPhone}
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#12372A]/10 text-[#12372A] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Office & Processing Facility
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-700 leading-snug">
                    {SITE_SETTINGS.address}
                  </p>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#12372A]/10 text-[#12372A] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Business Hours
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-700 leading-snug">
                    Monday – Saturday: 9:00 AM – 6:30 PM (IST)
                  </p>
                </div>
              </div>

            </div>

            {/* Small WhatsApp Quick Contact Button */}
            <div className="pt-2">
              <a
                href={`https://wa.me/${whatsappCleanNumber}?text=Hi%20Yumnest,%20I%20have%20an%20inquiry%20about%20your%20products.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

          </div>

          {/* ── Right Column: Clean Contact Form ── */}
          <div className="lg:col-span-7 w-full">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DFC8] p-6 sm:p-8 lg:p-10 shadow-xs text-left">
              
              <div className="mb-6 space-y-1">
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#12372A]">
                  Send Us a Message
                </h3>
                <p className="text-xs sm:text-sm text-stone-500">
                  Fill out the form below and our team will get back to you within 24 hours.
                </p>
              </div>

              {/* Success Message Banner */}
              {isSubmitted && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs sm:text-sm animate-in fade-in duration-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    Thank you! Your message has been sent successfully. We will be in touch shortly.
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="firstName" className="block text-xs font-semibold text-stone-700">
                      First Name <span className="text-[#D9381E]">*</span>
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="e.g. Rahul"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#12372A] focus:bg-white focus:ring-1 focus:ring-[#12372A] transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="lastName" className="block text-xs font-semibold text-stone-700">
                      Last Name <span className="text-[#D9381E]">*</span>
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="e.g. Menon"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#12372A] focus:bg-white focus:ring-1 focus:ring-[#12372A] transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-semibold text-stone-700">
                    Email Address <span className="text-[#D9381E]">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#12372A] focus:bg-white focus:ring-1 focus:ring-[#12372A] transition-all"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label htmlFor="message" className="block text-xs font-semibold text-stone-700">
                    Message <span className="text-[#D9381E]">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us what you're looking for..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#12372A] focus:bg-white focus:ring-1 focus:ring-[#12372A] transition-all resize-y"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#12372A] hover:bg-[#1A4D3B] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all shadow-xs hover:shadow-md active:scale-95 cursor-pointer disabled:opacity-60"
                  >
                    <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

              </form>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
