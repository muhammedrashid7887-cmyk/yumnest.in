'use client';

import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
  Send,
  Sparkles,
  ShieldCheck,
  Truck,
  Package,
  ChevronDown,
  Navigation,
} from 'lucide-react';
import { SITE_SETTINGS } from '@/data/mockData';

const TOPIC_OPTIONS = [
  'General Enquiry',
  'Wholesale & Bulk Order',
  'Retail Distribution',
  'Order Tracking & Status',
  'Product Information',
];

const FAQS = [
  {
    q: 'How fast will my order be dispatched and delivered?',
    a: 'Orders are freshly packed and dispatched within 24 hours of confirmation. Delivery takes 2–4 business days within Kerala and 4–6 business days for the rest of India with door-to-door tracking.',
  },
  {
    q: 'Can I purchase spices in bulk for restaurants or catering?',
    a: 'Yes! We offer wholesale rates and commercial pack sizes (1kg, 5kg, and bulk sacks) for restaurants, caterers, and retail stores. You can inquire directly via WhatsApp or email.',
  },
  {
    q: 'Are Yumnest spices pure and free from additives?',
    a: '100% yes. We strictly prohibit artificial food colourings, chemical tenderizers, fillers, and MSG. All spices are stone-ground to preserve natural essential oils and authentic aroma.',
  },
  {
    q: 'Can I place an order directly over WhatsApp?',
    a: 'Yes, our team can take your order directly on WhatsApp (+91 70122 68934), share the payment QR/UPI, and send your parcel tracking link right to your chat.',
  },
];

export const ContactPageContent: React.FC = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState(TOPIC_OPTIONS[0]);
  const [message, setMessage] = useState('');

  const whatsappCleanNumber = SITE_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '');

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(SITE_SETTINGS.supportEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('+91 70122 68934');
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = `🌿 *New Website Inquiry - Yumnest Spices*
👤 *Name:* ${fullName.trim() || 'Valued Customer'}
📞 *Phone:* ${phone.trim() || 'Not specified'}
🏷️ *Topic:* ${topic}
💬 *Message:* ${message.trim() || 'Hello Yumnest! I would like more details about your spices.'}`;

    const url = `https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent(formatted)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`[${topic}] Website Inquiry from ${fullName.trim() || 'Customer'}`);
    const body = encodeURIComponent(
      `Hello Yumnest Team,\n\nName: ${fullName.trim() || 'Not specified'}\nPhone: ${phone.trim() || 'Not specified'}\nTopic: ${topic}\n\nMessage:\n${message.trim() || 'I am interested in your products.'}\n\nRegards,\n${fullName.trim() || ''}`
    );
    window.location.href = `mailto:${SITE_SETTINGS.supportEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="pb-16 lg:pb-24">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 bg-gradient-to-b from-[#F3ECE1] via-[#F8F4ED] to-[#FBF9F5] border-b border-[#E8DFC8]">
        {/* Subtle decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#0F5638]/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#E8AA42]/10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#E8DFC8] shadow-2xs backdrop-blur-xs text-[#0F5638] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Store Support &amp; Distribution Hub • Kochi, Kerala</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0F5638] tracking-tight">
            Get in Touch with Yum Nest
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Have questions regarding our single-estate spices, bulk wholesale pricing, or direct orders? We are here to help you experience authentic Kerala purity.
          </p>

          {/* Quick Trust Highlights */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-medium text-stone-600">
            <span className="inline-flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-full border border-stone-200/80">
              <span className="text-emerald-600 font-bold">⚡</span> Quick WhatsApp Replies
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-full border border-stone-200/80">
              <Truck className="w-3.5 h-3.5 text-[#0F5638]" /> All-India Tracked Courier
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-full border border-stone-200/80">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F5638]" /> 100% Pure, Zero Additives
            </span>
          </div>
        </div>
      </section>

      {/* 3 Main Contact Cards Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Phone & WhatsApp Support */}
          <div className="bg-white rounded-2xl border border-[#E8DFC8] p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0F5638] border border-emerald-100 flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Instant Chat
                </span>
              </div>

              <div>
                <h2 className="font-bold text-lg text-stone-900">Phone &amp; WhatsApp</h2>
                <p className="text-xs text-stone-500 leading-relaxed mt-1">
                  Call directly or chat on WhatsApp for fast orders, fulfillment tracking, and culinary guidance.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-stone-200/70 space-y-1">
                <div className="flex items-center justify-between">
                  <a
                    href="tel:+917012268934"
                    className="text-base font-bold text-[#0F5638] hover:underline tracking-tight"
                  >
                    +91 70122 68934
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    title="Copy phone number"
                    className="p-1.5 rounded-md hover:bg-stone-200/70 text-stone-500 hover:text-stone-800 transition"
                  >
                    {copiedPhone ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Mon – Sat: 9:00 AM – 7:00 PM IST</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={`https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent('🌿 Hello Yumnest! I would like to enquire about your products and orders.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white text-xs font-bold transition shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
              <a
                href="tel:+917012268934"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition border border-stone-200"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Directly</span>
              </a>
            </div>
          </div>

          {/* Card 2: Email Enquiries */}
          <div className="bg-white rounded-2xl border border-[#E8DFC8] p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full">
                  Official Inbox
                </span>
              </div>

              <div>
                <h2 className="font-bold text-lg text-stone-900">Email Inquiries</h2>
                <p className="text-xs text-stone-500 leading-relaxed mt-1">
                  Send business proposals, institutional inquiries, bulk wholesale orders, or customer feedback.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-stone-200/70 space-y-1">
                <div className="flex items-center justify-between">
                  <a
                    href={`mailto:${SITE_SETTINGS.supportEmail}`}
                    className="text-sm sm:text-base font-bold text-stone-900 hover:text-[#0F5638] transition break-all"
                  >
                    {SITE_SETTINGS.supportEmail}
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    title="Copy email address"
                    className="p-1.5 rounded-md hover:bg-stone-200/70 text-stone-500 hover:text-stone-800 transition shrink-0 ml-1"
                  >
                    {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>24-Hour Business Response Guarantee</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={`mailto:${SITE_SETTINGS.supportEmail}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0F5638] hover:bg-[#126844] active:scale-[0.99] text-white text-xs font-bold transition shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Send Official Email</span>
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition border border-stone-200"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Email Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Email Address</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 3: Office & Operations */}
          <div className="bg-white rounded-2xl border border-[#E8DFC8] p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 text-[#0F5638] border border-stone-200 flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-full">
                  Registered Office
                </span>
              </div>

              <div>
                <h2 className="font-bold text-lg text-stone-900">Office &amp; Operations</h2>
                <p className="text-xs font-semibold text-[#0F5638] uppercase tracking-wide mt-1">
                  YUMNEST SPICES &amp; FOODS
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-stone-200/70 space-y-2">
                <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
                  Thoppumpady, Kochi – 5, Ernakulam, Kerala, India
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-stone-500 pt-1 border-t border-stone-200/60">
                  <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>Mon – Sat: 9:00 AM – 7:00 PM IST</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Thoppumpady+Kochi+Ernakulam+Kerala+India"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-900 hover:bg-black active:scale-[0.99] text-white text-xs font-bold transition shadow-xs"
              >
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 ml-auto text-stone-400" />
              </a>
              <div className="text-center">
                <span className="text-[11px] font-medium text-stone-500 inline-flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-stone-400" />
                  All-India Express Courier &amp; Bulk Cargo
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Message Builder & Brand Assurance Split Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Quick Inquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8DFC8] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F5638] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Direct Inquiry Form
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                Send Us a Message
              </h3>
              <p className="text-xs sm:text-sm text-stone-500">
                Choose your inquiry type below. You can send it directly via WhatsApp for an immediate reply or dispatch an official email.
              </p>
            </div>

            {/* Inquiry Topic Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">
                What is this inquiry regarding?
              </label>
              <div className="flex flex-wrap gap-2">
                {TOPIC_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTopic(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      topic === item
                        ? 'bg-[#0F5638] text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSendWhatsApp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact-name" className="text-xs font-bold text-stone-700">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Muhammed Rashid"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-phone" className="text-xs font-bold text-stone-700">
                    Phone / WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="text-xs font-bold text-stone-700">
                  Your Message or Requirement <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about the spice varieties, quantities, or specific questions you have..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition bg-white resize-y"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send via WhatsApp (Fastest)</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendEmail}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-semibold transition border border-stone-200 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send via Email</span>
                </button>
              </div>

              <p className="text-[11px] text-stone-500 text-center sm:text-left pt-1">
                🔒 Your privacy is fully respected. Your details are solely used to answer your inquiry.
              </p>
            </form>
          </div>

          {/* Right Column: Why Connect with Yumnest & Direct Help */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0F5638] text-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Purity &amp; Direct Heritage
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Why Order Direct from Yumnest?
              </h3>
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                We bridge Kerala traditional spice growers and your kitchen with uncompromising standards.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">Zero Chemical Additives</h4>
                    <p className="text-xs text-stone-300 leading-relaxed mt-0.5">
                      No artificial colourings, MSG, or synthetic fillers. Every gram is pure spice.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Package className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">Wholesale &amp; Retail Ready</h4>
                    <p className="text-xs text-stone-300 leading-relaxed mt-0.5">
                      Convenient pouches for homes and wholesale bulk sacks for restaurants and hotels.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Truck className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">Pan-India Express Dispatch</h4>
                    <p className="text-xs text-stone-300 leading-relaxed mt-0.5">
                      Fast shipping with active tracking across Kerala and every Indian state.
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct Urgent Helpline Box */}
              <div className="pt-4 border-t border-white/15">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-amber-300 font-semibold block">
                      Direct Helpline
                    </span>
                    <a
                      href="tel:+917012268934"
                      className="text-base sm:text-lg font-bold text-white hover:text-amber-200 transition"
                    >
                      +91 70122 68934
                    </a>
                  </div>
                  <a
                    href="tel:+917012268934"
                    className="px-3.5 py-1.5 rounded-xl bg-white text-[#0F5638] text-xs font-bold hover:bg-stone-100 transition"
                  >
                    Call Now
                  </a>
                </div>
              </div>
            </div>

            {/* FSSAI & Quality Badge Box */}
            <div className="bg-white rounded-2xl border border-[#E8DFC8] p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-stone-900 block">Authentic Kerala Quality Standards</span>
                <span className="text-stone-500 leading-relaxed mt-0.5 block">
                  Sourced from certified smallholder farms in Wayanad, Idukki &amp; Thalassery.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kochi Location & Map Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        <div className="bg-white rounded-3xl border border-[#E8DFC8] overflow-hidden shadow-sm">
          <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F5638]">
                Find Our Location
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                YUMNEST SPICES &amp; FOODS
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#0F5638] shrink-0" />
                <span>Thoppumpady, Kochi – 5, Ernakulam, Kerala, India</span>
              </p>
            </div>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Thoppumpady+Kochi+Ernakulam+Kerala+India"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F5638] hover:bg-[#126844] text-white text-xs sm:text-sm font-bold transition shadow-xs self-start md:self-auto cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Interactive Google Map Embed */}
          <div className="w-full h-72 sm:h-80 md:h-96 relative bg-stone-100">
            <iframe
              title="Yumnest Location - Thoppumpady Kochi"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15719.680608759684!2d76.2570!3d9.9328!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0872bd8a614d9b%3A0xb366b8dca24dbb0!2sThoppumpady%2C%20Kochi%2C%20Kerala!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0F5638]">
            Got Questions?
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Frequently Asked Questions
          </h3>
          <p className="text-xs sm:text-sm text-stone-500">
            Quick answers regarding customer support, wholesale partnerships, and deliveries.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#E8DFC8] overflow-hidden transition shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/70 transition"
                >
                  <span className="text-xs sm:text-sm font-bold text-stone-900">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-500 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'transform rotate-180 text-[#0F5638]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
