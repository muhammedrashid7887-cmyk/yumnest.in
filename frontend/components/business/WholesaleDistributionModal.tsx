'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Loader2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Truck,
  Building,
  Users,
  PackageCheck,
} from 'lucide-react';
import { getStorefrontProducts, getStorefrontCategories } from '@/lib/api/storefront';
import { submitWholesaleEnquiry, submitDistributorApplication } from '@/lib/api/business';
import { SITE_SETTINGS } from '@/data/mockData';
import {
  buildWhatsAppWholesaleMessage,
  buildWhatsAppDistributorMessage,
  getWhatsAppUrl,
} from '@/lib/utils/whatsapp';
import type {
  WholesaleEnquiry,
  DistributorApplication,
  CreateWholesaleEnquiryInput,
  CreateDistributorApplicationInput,
} from '@/types/api';

type ModalView =
  | 'choose'
  | 'wholesale'
  | 'distributor'
  | 'success_wholesale'
  | 'success_distributor';

interface WholesaleDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'choose' | 'wholesale' | 'distributor';
}

const BUSINESS_TYPES_WHOLESALE = [
  'Retail Shop',
  'Supermarket',
  'Restaurant',
  'Hotel',
  'Catering Business',
  'Food Distributor',
  'Other',
];

const BUSINESS_TYPES_DISTRIBUTOR = [
  'Wholesale Business',
  'Retail Distribution',
  'Supermarket',
  'Food Products Distribution',
  'Existing Distributor',
  'Other',
];

const POPULAR_STATES = [
  'Kerala',
  'Tamil Nadu',
  'Karnataka',
  'Maharashtra',
  'Delhi',
  'Andhra Pradesh',
  'Telangana',
  'Goa',
  'Gujarat',
  'Other State',
];

const KERALA_DISTRICTS = [
  'Ernakulam',
  'Kozhikode',
  'Malappuram',
  'Thrissur',
  'Thiruvananthapuram',
  'Kollam',
  'Kannur',
  'Palakkad',
  'Kottayam',
  'Alappuzha',
  'Kasaragod',
  'Pathanamthitta',
  'Idukki',
  'Wayanad',
];

export const WholesaleDistributionModal: React.FC<WholesaleDistributionModalProps> = ({
  isOpen,
  onClose,
  initialView = 'choose',
}) => {
  const [view, setView] = useState<ModalView>(initialView);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setView(initialView);
      setErrorMsg(null);
    }
  }

  // Dynamic Product & Category lists
  const [availableProducts, setAvailableProducts] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [loadingCatalogue, setLoadingCatalogue] = useState(false);

  // Submission results
  const [wholesaleResult, setWholesaleResult] = useState<WholesaleEnquiry | null>(null);
  const [distributorResult, setDistributorResult] = useState<DistributorApplication | null>(null);

  // Wholesale Form State
  const [wholesaleForm, setWholesaleForm] = useState<CreateWholesaleEnquiryInput>({
    fullName: '',
    businessName: '',
    mobile: '',
    whatsapp: '',
    email: '',
    state: 'Kerala',
    district: '',
    businessType: 'Retail Shop',
    interestedProducts: [],
    requiredQuantity: '',
    message: '',
  });

  // Distributor Form State
  const [distributorForm, setDistributorForm] = useState<CreateDistributorApplicationInput>({
    fullName: '',
    businessName: '',
    mobile: '',
    whatsapp: '',
    email: '',
    state: 'Kerala',
    district: '',
    city: '',
    address: '',
    businessType: 'Wholesale Business',
    distributionExperience: 'no',
    experienceDetails: '',
    interestedCategories: [],
    additionalInformation: '',
  });



  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Dynamically load products and categories from MongoDB/API
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    async function loadData() {
      setLoadingCatalogue(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          getStorefrontProducts({ limit: 50 }),
          getStorefrontCategories(),
        ]);
        if (isMounted) {
          if (prodRes?.products && prodRes.products.length > 0) {
            setAvailableProducts(prodRes.products.map((p) => p.name));
          } else {
            setAvailableProducts([
              'Yumnest Broast Masala Powder',
              'Broast Prawns Masala Powder',
              'Tellicherry Black Pepper',
              'Idukki Green Cardamom',
              'Wayanad Golden Turmeric',
              'Pure Cold Pressed Coconut Oil',
              'Kashmiri Chili Powder',
              'Kerala Meat Masala',
            ]);
          }

          if (catRes && catRes.length > 0) {
            const filtered = catRes
              .filter((c) => c.name !== 'All Products')
              .map((c) => c.name);
            setAvailableCategories(
              filtered.length > 0
                ? filtered
                : ['Pure Spices', 'Signature Masala Blends', 'Cold Pressed Oils', 'Commercial Bulk Packs']
            );
          } else {
            setAvailableCategories([
              'Pure Spices',
              'Signature Masala Blends',
              'Cold Pressed Oils',
              'Commercial Bulk Packs',
            ]);
          }
        }
      } catch {
        if (isMounted) {
          setAvailableProducts([
            'Yumnest Broast Masala Powder',
            'Broast Prawns Masala Powder',
            'Tellicherry Black Pepper',
            'Idukki Green Cardamom',
            'Wayanad Golden Turmeric',
            'Pure Cold Pressed Coconut Oil',
          ]);
          setAvailableCategories([
            'Pure Spices',
            'Signature Masala Blends',
            'Cold Pressed Oils',
            'Commercial Bulk Packs',
          ]);
        }
      } finally {
        if (isMounted) setLoadingCatalogue(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const whatsappCleanNumber = SITE_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '');

  // ── Toggle Helper for Products Multiple Selection ──────────────────────────
  const toggleProduct = (prodName: string) => {
    setWholesaleForm((prev) => {
      const exists = prev.interestedProducts.includes(prodName);
      return {
        ...prev,
        interestedProducts: exists
          ? prev.interestedProducts.filter((p) => p !== prodName)
          : [...prev.interestedProducts, prodName],
      };
    });
  };

  // ── Toggle Helper for Categories Multiple Selection ────────────────────────
  const toggleCategory = (catName: string) => {
    setDistributorForm((prev) => {
      const exists = prev.interestedCategories.includes(catName);
      return {
        ...prev,
        interestedCategories: exists
          ? prev.interestedCategories.filter((c) => c !== catName)
          : [...prev.interestedCategories, catName],
      };
    });
  };

  // ── Handle Wholesale Submit ───────────────────────────────────────────────
  const handleSubmitWholesale = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!wholesaleForm.fullName.trim()) return setErrorMsg('Full Name is required');
    if (!wholesaleForm.businessName.trim()) return setErrorMsg('Business/Shop Name is required');
    if (!wholesaleForm.mobile.trim() || wholesaleForm.mobile.replace(/\D/g, '').length < 10) {
      return setErrorMsg('Please enter a valid 10-digit mobile number');
    }
    if (!wholesaleForm.district.trim()) return setErrorMsg('District is required');
    if (wholesaleForm.interestedProducts.length === 0) {
      return setErrorMsg('Please select at least one product of interest');
    }
    if (!wholesaleForm.requiredQuantity.trim()) {
      return setErrorMsg('Required quantity is required (e.g. 50 kg, 20 cartons)');
    }

    setSubmitting(true);
    try {
      const result = await submitWholesaleEnquiry(wholesaleForm);
      setWholesaleResult(result);
      setView('success_wholesale');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit enquiry. Please try again.';
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Handle Distributor Submit ─────────────────────────────────────────────
  const handleSubmitDistributor = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!distributorForm.fullName.trim()) return setErrorMsg('Full Name is required');
    if (!distributorForm.businessName.trim()) return setErrorMsg('Business Name is required');
    if (!distributorForm.mobile.trim() || distributorForm.mobile.replace(/\D/g, '').length < 10) {
      return setErrorMsg('Please enter a valid 10-digit mobile number');
    }
    if (!distributorForm.district.trim()) return setErrorMsg('District is required');
    if (!distributorForm.city.trim()) return setErrorMsg('City / Town is required');
    if (!distributorForm.address.trim()) return setErrorMsg('Full Business Address is required');
    if (distributorForm.interestedCategories.length === 0) {
      return setErrorMsg('Please select at least one product category');
    }

    setSubmitting(true);
    try {
      const result = await submitDistributorApplication(distributorForm);
      setDistributorResult(result);
      setView('success_distributor');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit application. Please try again.';
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Prefilled WhatsApp message generators ──────────────────────────────────
  const getWholesaleWhatsAppUrl = () => {
    if (!wholesaleResult) return `https://wa.me/${whatsappCleanNumber}`;
    const location = [wholesaleResult.district, wholesaleResult.state].filter(Boolean).join(', ');
    const msg = buildWhatsAppWholesaleMessage({
      enquiryId: wholesaleResult.enquiryId,
      fullName: wholesaleResult.fullName,
      businessName: wholesaleResult.businessName,
      location,
      products: wholesaleResult.interestedProducts,
      quantity: wholesaleResult.requiredQuantity,
    });
    return getWhatsAppUrl(whatsappCleanNumber, msg);
  };

  const getDistributorWhatsAppUrl = () => {
    if (!distributorResult) return `https://wa.me/${whatsappCleanNumber}`;
    const location = [distributorResult.city, distributorResult.district, distributorResult.state].filter(Boolean).join(', ');
    const msg = buildWhatsAppDistributorMessage({
      applicationId: distributorResult.applicationId,
      fullName: distributorResult.fullName,
      businessName: distributorResult.businessName,
      location,
      businessType: distributorResult.businessType,
      categories: distributorResult.interestedCategories,
    });
    return getWhatsAppUrl(whatsappCleanNumber, msg);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden text-stone-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Standard Clean Top Bar ── */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 border-b border-stone-100 bg-white shrink-0">
          <div className="flex items-center gap-2">
            {view !== 'choose' && !view.startsWith('success') && (
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setView('choose');
                }}
                className="inline-flex items-center gap-1.5 py-1 px-2.5 -ml-1.5 rounded-lg hover:bg-stone-100 text-stone-600 hover:text-stone-900 text-xs font-semibold transition cursor-pointer"
                aria-label="Go back to options"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
            <div className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E8AA42]" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                Wholesale &amp; Distribution
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 flex items-center justify-center transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable Modal Body ── */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 custom-scrollbar bg-white">

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 1: CHOOSE OPTION ("Grow Your Business with Yum Nest")
             ══════════════════════════════════════════════════════════════════ */}
          {view === 'choose' && (
            <div className="space-y-6 py-2">
              {/* Heading */}
              <div className="text-center max-w-lg mx-auto">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                  Grow Your Business with Yum Nest
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
                  Discover wholesale opportunities and become a part of our growing distribution network. Let&apos;s build something great together.
                </p>
              </div>

              {/* Two Attractive Clean Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-1">

                {/* CARD 1: WHOLESALE ENQUIRY */}
                <div className="relative rounded-2xl border border-stone-200 bg-white hover:border-[#0F5638] shadow-xs hover:shadow-lg transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between group">
                  <div className="space-y-2.5">
                    <h3 className="text-lg sm:text-xl font-bold text-stone-900 group-hover:text-[#0F5638] transition-colors">
                      Wholesale Enquiry
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                      Looking to purchase our products in bulk? Get in touch with us for wholesale pricing and business enquiries.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setView('wholesale');
                    }}
                    className="mt-6 w-full py-3 px-4 rounded-full bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow hover:scale-[1.01] cursor-pointer"
                  >
                    <span>Enquire Now</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* CARD 2: BECOME A DISTRIBUTOR */}
                <div className="relative rounded-2xl border border-stone-200 bg-white hover:border-[#0F5638] shadow-xs hover:shadow-lg transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between group">
                  <div className="space-y-2.5">
                    <h3 className="text-lg sm:text-xl font-bold text-stone-900 group-hover:text-[#0F5638] transition-colors">
                      Become a Distributor
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                      Interested in representing Yum Nest in your region? Apply to become an authorized distribution partner.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setView('distributor');
                    }}
                    className="mt-6 w-full py-3 px-4 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow hover:scale-[1.01] cursor-pointer"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 2: WHOLESALE ENQUIRY FORM
             ══════════════════════════════════════════════════════════════════ */}
          {view === 'wholesale' && (
            <form onSubmit={handleSubmitWholesale} className="space-y-5">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                  Wholesale Enquiry
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                  Tell us about your business and bulk requirements. Our team will contact you shortly.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">&bull;</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* 1. Full Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={wholesaleForm.fullName}
                    onChange={(e) => setWholesaleForm({ ...wholesaleForm, fullName: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition"
                  />
                </div>

                {/* 2. Business / Shop Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Business / Shop Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={wholesaleForm.businessName}
                    onChange={(e) => setWholesaleForm({ ...wholesaleForm, businessName: e.target.value })}
                    placeholder="e.g. Al-Madina Supermarket &amp; Fried Chicken"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition"
                  />
                </div>

                {/* 3. Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={wholesaleForm.mobile}
                    onChange={(e) => setWholesaleForm({ ...wholesaleForm, mobile: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition"
                  />
                </div>

                {/* 4. WhatsApp Number */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    WhatsApp Number <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={wholesaleForm.whatsapp}
                    onChange={(e) => setWholesaleForm({ ...wholesaleForm, whatsapp: e.target.value })}
                    placeholder="If different from mobile"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition"
                  />
                </div>

                {/* 5. Email Address */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Email Address <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={wholesaleForm.email}
                    onChange={(e) => setWholesaleForm({ ...wholesaleForm, email: e.target.value })}
                    placeholder="business@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition"
                  />
                </div>

                {/* 6. State */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={wholesaleForm.state}
                    onChange={(e) => setWholesaleForm({ ...wholesaleForm, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition"
                  >
                    {POPULAR_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 7. District */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    District <span className="text-red-500">*</span>
                  </label>
                  {wholesaleForm.state === 'Kerala' ? (
                    <select
                      value={wholesaleForm.district}
                      onChange={(e) => setWholesaleForm({ ...wholesaleForm, district: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition"
                    >
                      <option value="">Select District</option>
                      {KERALA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={wholesaleForm.district}
                      onChange={(e) => setWholesaleForm({ ...wholesaleForm, district: e.target.value })}
                      placeholder="e.g. Coimbatore, Bengaluru Urban"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition"
                    />
                  )}
                </div>

                {/* 8. Business Type */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Business Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={wholesaleForm.businessType}
                    onChange={(e) => setWholesaleForm({ ...wholesaleForm, businessType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition"
                  >
                    {BUSINESS_TYPES_WHOLESALE.map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* 9. Interested Products (Multiple Selection dynamically loaded) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Interested Products <span className="text-red-500">*</span>{' '}
                  <span className="text-[11px] font-normal text-stone-500">
                    (Click to select all required items)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto p-3 rounded-xl bg-stone-50 border border-stone-200">
                  {loadingCatalogue && availableProducts.length === 0 ? (
                    <div className="text-xs text-stone-400 flex items-center gap-2 py-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Loading products...</span>
                    </div>
                  ) : (
                    availableProducts.map((pName) => {
                      const isSelected = wholesaleForm.interestedProducts.includes(pName);
                      return (
                        <button
                          key={pName}
                          type="button"
                          onClick={() => toggleProduct(pName)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border ${
                            isSelected
                              ? 'bg-[#0F5638] text-white border-[#0F5638] shadow-2xs'
                              : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                          <span>{pName}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 10. Required Quantity */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Required Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={wholesaleForm.requiredQuantity}
                  onChange={(e) => setWholesaleForm({ ...wholesaleForm, requiredQuantity: e.target.value })}
                  placeholder="e.g. 50 kg / 25 cartons / 100 packets monthly"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition"
                />
              </div>

              {/* 11. Additional Message */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Additional Message <span className="text-stone-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={wholesaleForm.message}
                  onChange={(e) => setWholesaleForm({ ...wholesaleForm, message: e.target.value })}
                  placeholder="Any specific delivery frequency, customization, or notes..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] resize-none transition"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setView('choose')}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-6 rounded-full bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Enquiry...</span>
                    </>
                  ) : (
                    <span>Submit Wholesale Enquiry</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 3: DISTRIBUTOR APPLICATION FORM
             ══════════════════════════════════════════════════════════════════ */}
          {view === 'distributor' && (
            <form onSubmit={handleSubmitDistributor} className="space-y-5">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                  Become a Yum Nest Distributor
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                  Join our growing distribution network and bring quality Yum Nest products to more customers.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">&bull;</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* 1. Full Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={distributorForm.fullName}
                    onChange={(e) => setDistributorForm({ ...distributorForm, fullName: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition"
                  />
                </div>

                {/* 2. Business Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={distributorForm.businessName}
                    onChange={(e) => setDistributorForm({ ...distributorForm, businessName: e.target.value })}
                    placeholder="e.g. Malabar Spices &amp; Foods Agency"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition"
                  />
                </div>

                {/* 3. Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={distributorForm.mobile}
                    onChange={(e) => setDistributorForm({ ...distributorForm, mobile: e.target.value })}
                    placeholder="10-digit primary mobile"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition"
                  />
                </div>

                {/* 4. WhatsApp Number */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    WhatsApp Number <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={distributorForm.whatsapp}
                    onChange={(e) => setDistributorForm({ ...distributorForm, whatsapp: e.target.value })}
                    placeholder="If different from mobile"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition"
                  />
                </div>

                {/* 5. Email Address */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Email Address <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={distributorForm.email}
                    onChange={(e) => setDistributorForm({ ...distributorForm, email: e.target.value })}
                    placeholder="distributor@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition"
                  />
                </div>

                {/* 6. State */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={distributorForm.state}
                    onChange={(e) => setDistributorForm({ ...distributorForm, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition"
                  >
                    {POPULAR_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 7. District */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    District <span className="text-red-500">*</span>
                  </label>
                  {distributorForm.state === 'Kerala' ? (
                    <select
                      value={distributorForm.district}
                      onChange={(e) => setDistributorForm({ ...distributorForm, district: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition"
                    >
                      <option value="">Select District</option>
                      {KERALA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={distributorForm.district}
                      onChange={(e) => setDistributorForm({ ...distributorForm, district: e.target.value })}
                      placeholder="e.g. Coimbatore, Mysore"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition"
                    />
                  )}
                </div>

                {/* 8. City / Town */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    City / Town <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={distributorForm.city}
                    onChange={(e) => setDistributorForm({ ...distributorForm, city: e.target.value })}
                    placeholder="e.g. Aluva, Manjeri, Kochi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition"
                  />
                </div>

              </div>

              {/* 9. Full Business Address */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Full Business Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={distributorForm.address}
                  onChange={(e) => setDistributorForm({ ...distributorForm, address: e.target.value })}
                  placeholder="Building name, street, landmarks, pincode..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] resize-none transition"
                />
              </div>

              {/* 10. Business Type */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Business Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={distributorForm.businessType}
                  onChange={(e) => setDistributorForm({ ...distributorForm, businessType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition"
                >
                  {BUSINESS_TYPES_DISTRIBUTOR.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </div>

              {/* 11 & 12. Distribution Experience (Yes / No) */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-stone-800">
                    Do you have previous FMCG / food distribution experience? <span className="text-red-500">*</span>
                  </span>
                  <div className="inline-flex rounded-lg border border-stone-200 bg-white p-0.5">
                    <button
                      type="button"
                      onClick={() => setDistributorForm({ ...distributorForm, distributionExperience: 'yes' })}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                        distributorForm.distributionExperience === 'yes'
                          ? 'bg-[#0F5638] text-white shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setDistributorForm({ ...distributorForm, distributionExperience: 'no' })}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                        distributorForm.distributionExperience === 'no'
                          ? 'bg-[#0F5638] text-white shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {distributorForm.distributionExperience === 'yes' && (
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Describe your distribution experience, coverage area, or fleet:
                    </label>
                    <textarea
                      rows={2}
                      value={distributorForm.experienceDetails}
                      onChange={(e) => setDistributorForm({ ...distributorForm, experienceDetails: e.target.value })}
                      placeholder="e.g. 5 years supplying 120 supermarkets across Ernakulam..."
                      className="w-full px-3 py-2 rounded-lg bg-white border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* 13. Interested Product Categories (Multiple Selection dynamically loaded) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Interested Product Categories <span className="text-red-500">*</span>{' '}
                  <span className="text-[11px] font-normal text-stone-500">
                    (Click to select all that apply)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-stone-50 border border-stone-200">
                  {loadingCatalogue && availableCategories.length === 0 ? (
                    <div className="text-xs text-stone-400 flex items-center gap-2 py-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Loading categories...</span>
                    </div>
                  ) : (
                    availableCategories.map((cName) => {
                      const isSelected = distributorForm.interestedCategories.includes(cName);
                      return (
                        <button
                          key={cName}
                          type="button"
                          onClick={() => toggleCategory(cName)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border ${
                            isSelected
                              ? 'bg-[#0F5638] text-white border-[#0F5638] shadow-2xs'
                              : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                          <span>{cName}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 14. Additional Information */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Additional Information <span className="text-stone-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={distributorForm.additionalInformation}
                  onChange={(e) => setDistributorForm({ ...distributorForm, additionalInformation: e.target.value })}
                  placeholder="Fleet size, warehouse capacity, or other details..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] resize-none transition"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setView('choose')}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-6 rounded-full bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <span>Submit Distributor Application</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 4: SUCCESS CONFIRMATION - WHOLESALE
             ══════════════════════════════════════════════════════════════════ */}
          {view === 'success_wholesale' && wholesaleResult && (
            <div className="text-center py-5 space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#0F5638] flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-stone-100 text-[#0F5638] border border-stone-200 text-xs font-mono font-bold tracking-wider mb-2">
                  Ref: {wholesaleResult.enquiryId}
                </span>
                <h3 className="text-2xl font-extrabold text-stone-900">
                  Enquiry Received Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
                  Thank you for your interest in Yum Nest Wholesale! Your enquiry has been received successfully. Our team will contact you soon.
                </p>
              </div>

              {/* Summary Card */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-stone-200/60">
                  <span className="text-stone-500">Business:</span>
                  <span className="font-bold text-stone-900">{wholesaleResult.businessName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200/60">
                  <span className="text-stone-500">Contact:</span>
                  <span className="font-semibold text-stone-900">{wholesaleResult.mobile}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200/60">
                  <span className="text-stone-500">Location:</span>
                  <span className="font-semibold text-stone-900">
                    {wholesaleResult.district}, {wholesaleResult.state}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-500">Required Quantity:</span>
                  <span className="font-bold text-[#0F5638]">{wholesaleResult.requiredQuantity}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="max-w-md mx-auto space-y-2.5 pt-2">
                <a
                  href={getWholesaleWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 shadow-sm hover:shadow transition cursor-pointer"
                >
                  <img
                    src="/assets/whatsapp-icon.png"
                    alt="WhatsApp"
                    className="w-5 h-5 object-contain shrink-0"
                  />
                  <span>Chat with B2B Team on WhatsApp</span>
                  <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
                >
                  Done &amp; Return to Store
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 5: SUCCESS CONFIRMATION - DISTRIBUTOR
             ══════════════════════════════════════════════════════════════════ */}
          {view === 'success_distributor' && distributorResult && (
            <div className="text-center py-5 space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-stone-100 text-stone-800 border border-stone-200 text-xs font-mono font-bold tracking-wider mb-2">
                  Application ID: {distributorResult.applicationId}
                </span>
                <h3 className="text-2xl font-extrabold text-stone-900">
                  Application Submitted!
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
                  Thank you for your interest in becoming a Yum Nest Distributor. Your application has been submitted successfully. Our team will review your application and contact you.
                </p>
              </div>

              {/* Summary Card */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-stone-200/60">
                  <span className="text-stone-500">Applicant:</span>
                  <span className="font-bold text-stone-900">{distributorResult.fullName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200/60">
                  <span className="text-stone-500">Agency / Firm:</span>
                  <span className="font-semibold text-stone-900">{distributorResult.businessName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200/60">
                  <span className="text-stone-500">Territory:</span>
                  <span className="font-semibold text-stone-900">
                    {distributorResult.city}, {distributorResult.district}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-500">Categories:</span>
                  <span className="font-bold text-[#0F5638]">
                    {distributorResult.interestedCategories.join(', ')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="max-w-md mx-auto space-y-2.5 pt-2">
                <a
                  href={getDistributorWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 shadow-sm hover:shadow transition cursor-pointer"
                >
                  <img
                    src="/assets/whatsapp-icon.png"
                    alt="WhatsApp"
                    className="w-5 h-5 object-contain shrink-0"
                  />
                  <span>Connect with Distribution Desk on WhatsApp</span>
                  <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
                >
                  Done &amp; Return to Store
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
