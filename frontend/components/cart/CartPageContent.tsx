'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { SITE_SETTINGS } from '@/data/mockData';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  MessageCircle, 
  X,
  MapPin,
  User,
  Phone
} from 'lucide-react';

interface CheckoutForm {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  notes: string;
}

export const CartPageContent: React.FC = () => {
  const { 
    items, 
    subtotal, 
    shippingFee, 
    total, 
    updateQuantity, 
    removeItem 
  } = useCart();

  const [formData, setFormData] = useState<CheckoutForm>({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const whatsappCleanNumber = SITE_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '');

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CheckoutForm, string>> = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      errors.phone = 'Valid 10-digit WhatsApp number is required';
    }
    if (!formData.address.trim()) {
      errors.address = 'Delivery address is required';
    }
    if (!formData.city.trim()) {
      errors.city = 'City or district is required';
    }
    if (!formData.pincode.trim() || formData.pincode.trim().length < 6) {
      errors.pincode = 'Valid 6-digit PIN code is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateWhatsAppOrderUrl = (withAddress: boolean = false) => {
    const itemLines = items.map(
      (item, idx) =>
        `${idx + 1}. ${item.product.name} (${item.variant.weight}) x ${item.quantity} = ₹${
          (item.variant.salePrice || item.variant.price) * item.quantity
        }`
    );

    let message = `*YUMNEST SPICES - ORDER REQUEST*%0A`;
    message += `--------------------------------%0A`;
    message += `*ORDER ITEMS:*%0A${itemLines.join('%0A')}%0A`;
    message += `--------------------------------%0A`;
    message += `*Subtotal:* ₹${subtotal}%0A`;
    message += `*Shipping:* ${shippingFee === 0 ? 'FREE' : '₹' + shippingFee}%0A`;
    message += `*Grand Total:* ₹${total}%0A`;

    if (withAddress && formData.name.trim()) {
      message += `--------------------------------%0A`;
      message += `*DELIVERY DETAILS:*%0A`;
      message += `*Name:* ${formData.name.trim()}%0A`;
      message += `*Phone:* ${formData.phone.trim()}%0A`;
      message += `*Address:* ${formData.address.trim()}%0A`;
      message += `*City/District:* ${formData.city.trim()}%0A`;
      message += `*PIN Code:* ${formData.pincode.trim()}%0A`;
      if (formData.notes.trim()) {
        message += `*Notes:* ${formData.notes.trim()}%0A`;
      }
    }

    message += `--------------------------------%0A`;
    message += `Please confirm my order and share invoice/delivery details. Thank you!`;

    return `https://wa.me/${whatsappCleanNumber}?text=${message}`;
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    window.open(generateWhatsAppOrderUrl(true), '_blank');
    setShowCheckoutModal(false);
  };

  return (
    <div className="bg-[#FBF9F5] min-h-screen py-8 sm:py-12 text-[#1C1917]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        
        {items.length === 0 ? (
          /* Empty Cart Card matching Screen 4 reference inset */
          <div className="bg-[#F6F2E9] rounded-3xl p-8 sm:p-12 text-center border border-[#EAE3D2] shadow-xs my-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-white text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
              <ShoppingBag className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                Your cart is empty
              </h2>
              <p className="text-xs sm:text-sm text-stone-500">
                Looks like you haven&apos;t added anything yet.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#12372A] hover:bg-[#1A4D3B] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          /* Active Cart View matching Screen 4 */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-stone-100">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  Your Cart
                </h1>
                <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
                  Good food brings people together.
                </p>
              </div>

              <Link
                href="/products"
                className="px-4 py-1.5 rounded-full border border-stone-300 hover:border-[#12372A] text-xs font-semibold text-stone-700 hover:text-[#12372A] transition-colors"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Line Items List */}
            <div className="divide-y divide-stone-100">
              {items.map((item) => {
                const price = item.variant.salePrice || item.variant.price;
                return (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#F8F6F0] p-1.5 shrink-0 flex items-center justify-center overflow-hidden border border-stone-100">
                        <img
                          src={item.product.primaryImage}
                          alt={item.product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-serif font-bold text-xs sm:text-sm text-stone-900 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-[11px] text-stone-500">{item.variant.weight}</p>
                        <p className="font-serif font-bold text-sm text-[#12372A] mt-0.5">
                          ₹{price}.00
                        </p>

                        {/* Stepper */}
                        <div className="flex items-center rounded-lg border border-stone-200 bg-white shadow-2xs mt-1.5 w-fit">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-2.5 py-1 text-stone-600 hover:bg-stone-50 text-xs font-bold cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-stone-900 min-w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-2.5 py-1 text-stone-600 hover:bg-stone-50 text-xs font-bold cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Trash Button */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Subtotal, Shipping, Total Summary matching Screen 4 */}
            <div className="pt-4 border-t border-stone-200 space-y-2">
              <div className="flex justify-between text-xs sm:text-sm text-stone-600">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900">₹{subtotal}.00</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-stone-600">
                <span className="flex items-center gap-1">
                  Shipping <span className="text-stone-400 text-xs">ⓘ</span>
                </span>
                <span className="font-semibold text-emerald-700">
                  {shippingFee === 0 ? 'Free' : `₹${shippingFee}.00`}
                </span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-bold text-stone-900 pt-2 border-t border-stone-100">
                <span>Total</span>
                <span className="font-serif text-[#12372A]">₹{total}.00</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-3">
              {/* Proceed to Checkout -> */}
              <button
                type="button"
                onClick={() => setShowCheckoutModal(true)}
                className="w-full py-3.5 sm:py-4 px-6 rounded-xl bg-[#12372A] hover:bg-[#1A4D3B] text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <span>→</span>
              </button>

              {/* Order via WhatsApp */}
              <a
                href={generateWhatsAppOrderUrl(false)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 sm:py-4 px-6 rounded-xl bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#22C55E]/60 text-[#15803D] text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Order via WhatsApp</span>
              </a>
            </div>

          </div>
        )}

      </div>

      {/* Checkout Address Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200">
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-bold text-[#12372A] mb-1">
              Delivery Details
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              Enter your shipping address. We will prepare your order and connect you directly to WhatsApp.
            </p>

            <form onSubmit={handleCheckoutSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-[#12372A]"
                  />
                </div>
                {formErrors.name && (
                  <p className="text-[11px] text-red-600 mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  WhatsApp Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="e.g. 9847012345"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-[#12372A]"
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-[11px] text-red-600 mt-1">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  House / Flat / Street Address *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="e.g. 14/204 Spice Villa, MG Road"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-[#12372A]"
                  />
                </div>
                {formErrors.address && (
                  <p className="text-[11px] text-red-600 mt-1">{formErrors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="e.g. Kochi"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-[#12372A]"
                  />
                  {formErrors.city && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    placeholder="e.g. 682001"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-[#12372A]"
                  />
                  {formErrors.pincode && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.pincode}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Delivery Notes (Optional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="e.g. Near town hall"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-[#12372A]"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#12372A] hover:bg-[#1A4D3B] text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Confirm & Send Order via WhatsApp (₹{total})</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
