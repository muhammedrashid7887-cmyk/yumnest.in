'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { SITE_SETTINGS } from '@/data/mockData';
import { createOrder } from '@/lib/api/orders';
import type { Order, CreateOrderInput } from '@/types/api';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  X,
  MapPin,
  User,
  Phone,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
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
    removeItem,
    clearCart,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  const handleCopyOrderId = (orderNum: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(orderNum).then(() => {
        setCopiedOrderId(true);
        setTimeout(() => setCopiedOrderId(false), 2500);
      }).catch(() => {});
    }
  };

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

  const buildWhatsAppOrderUrl = (order: Order) => {
    const itemLines = order.items.map((item, idx) => {
      return `${idx + 1}️⃣ *${item.productName}*\n   ▸ Qty: ${item.quantity} | Price: ₹${item.totalPrice}`;
    });

    let message = ` *YUMNEST FOODS & SPICES* \n`;
    message += `_Authentic Kerala Heritage Flavours_\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📋 *ORDER ID: ${order.orderNumber}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `👤 *Customer:* ${order.customerName}\n`;
    message += `📞 *Phone:* ${order.phone}\n\n`;
    message += `📦 *PRODUCTS:*\n${itemLines.join('\n\n')}\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💰 *BILLING SUMMARY:*\n`;
    message += `   ▸ Subtotal: ₹${order.subtotal}\n`;
    message += `   ▸ Delivery: ${order.deliveryCharge === 0 ? 'FREE 🚚' : '₹' + order.deliveryCharge}\n`;
    message += `   ▸ *Grand Total: ₹${order.totalAmount}*\n`;
    message += `   ▸ Payment Method: ${order.paymentMethod}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `📍 *DELIVERY ADDRESS:*\n`;
    message += `   ${order.address}, ${order.city} - ${order.pincode}\n`;
    if (order.deliveryNotes) {
      message += `   📝 *Notes:* ${order.deliveryNotes}\n`;
    }
    message += `\n_Please confirm availability and share payment / delivery details. Thank you!_`;

    return `https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload: CreateOrderInput = {
        customerName: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        pincode: formData.pincode.trim(),
        deliveryNotes: formData.notes.trim() || undefined,
        items: items.map((item) => {
          const rawId = item.product._id || item.product.id;
          const rawVariantId = item.variant._id || item.variant.id;
          return {
            productId: rawId && /^[a-f\d]{24}$/i.test(rawId) ? rawId : undefined,
            variantId: rawVariantId && /^[a-f\d]{24}$/i.test(rawVariantId) ? rawVariantId : undefined,
            variantName: item.variant.variantName || item.variant.weight,
            sku: item.variant.sku,
            productName: `${item.product.name} (${item.variant.weight})`,
            quantity: item.quantity,
            unitPrice: item.variant.salePrice || item.variant.price,
          };
        }),
        deliveryCharge: shippingFee,
        paymentMethod: 'WhatsApp COD',
      };

      const order = await createOrder(payload);
      setConfirmedOrder(order);
      setShowCheckoutModal(false);
      clearCart();

      // Save order to customer local history
      try {
        const stored = localStorage.getItem('yumnest_customer_orders');
        const list = stored ? JSON.parse(stored) : [];
        const updated = [
          order,
          ...list.filter((o: { id?: string; orderNumber?: string }) => o.id !== order.id && o.orderNumber !== order.orderNumber),
        ];
        localStorage.setItem('yumnest_customer_orders', JSON.stringify(updated.slice(0, 30)));
      } catch (e) {
        console.warn('Could not save order locally:', e);
      }

      // Launch WhatsApp chat with the generated order details & ID
      const waUrl = buildWhatsAppOrderUrl(order);
      window.open(waUrl, '_blank');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order. Please try again.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── If Order Confirmed Screen ──────────────────────────────────────────────
  if (confirmedOrder) {
    return (
      <div className="bg-[#FBF9F5] min-h-screen py-10 sm:py-16 text-[#1C1917]">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E3E9E5] shadow-lg text-center space-y-6">
            
            <div className="w-20 h-20 rounded-full bg-[#E3F2EA] text-[#0F6B47] flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0F6B47] text-white">
                Order Placed Successfully
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                Thank you, {confirmedOrder.customerName}!
              </h1>
              <p className="text-sm text-stone-500">
                Your order has been recorded in our system.
              </p>
            </div>

            {/* Order ID highlight card */}
            <div className="bg-[#F3F6F4] rounded-2xl p-4 sm:p-5 border border-[#E3E9E5] text-left space-y-2">
              <div className="flex justify-between items-center text-xs text-stone-500">
                <span>Order Reference ID</span>
                <span className="font-semibold text-emerald-800 uppercase">Saved to Database</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-xl sm:text-2xl font-black text-[#0B4A33] tracking-wide font-mono select-all">
                  {confirmedOrder.orderNumber}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyOrderId(confirmedOrder.orderNumber)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200 shadow-2xs transition-colors cursor-pointer"
                  title="Copy Order ID"
                >
                  {copiedOrderId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>
              <div className="pt-2 border-t border-[#E3E9E5] flex justify-between items-center text-xs text-stone-600">
                <span>Total Amount:</span>
                <span className="font-bold text-stone-900 text-sm">₹{confirmedOrder.totalAmount}.00</span>
              </div>
            </div>

            {/* Explanatory note */}
            <p className="text-xs text-stone-500 leading-relaxed max-w-md mx-auto">
              A WhatsApp conversation window was opened. If it didn&apos;t open automatically, you can tap below to send the details directly to our WhatsApp support team.
            </p>

            {/* Action buttons */}
            <div className="space-y-3 pt-2">
              <a
                href={buildWhatsAppOrderUrl(confirmedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer"
              >
                <img src="/assets/whatsapp-icon.png" alt="WhatsApp" className="w-5 h-5 object-contain" />
                <span>Open WhatsApp Chat Again</span>
              </a>

              <Link
                href={`/account?orderId=${encodeURIComponent(confirmedOrder.orderNumber)}`}
                className="inline-flex items-center justify-center w-full py-3.5 px-6 rounded-xl bg-[#0F5638] hover:bg-[#187A4F] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors"
              >
                View &amp; Track in My Account
              </Link>

              <Link
                href="/products"
                className="inline-flex items-center justify-center w-full py-3 px-6 rounded-xl border border-stone-300 hover:border-[#0F6B47] text-stone-700 hover:text-[#0F6B47] font-semibold text-xs uppercase tracking-wider transition-colors"
              >
                Continue Shopping
              </Link>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ─── Standard Cart View ─────────────────────────────────────────────────────
  return (
    <div className="bg-[#FBF9F5] py-4 sm:py-8 text-[#1C1917]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {items.length === 0 ? (
          <div className="bg-[#F6F2E9] rounded-3xl p-8 sm:p-12 text-center border border-[#EAE3D2] shadow-xs my-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-white text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
              <ShoppingBag className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight leading-tight">
                Your cart is empty
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 font-normal">
                Looks like you haven&apos;t added anything yet.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Continue Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-stone-100">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 leading-tight tracking-tight">
                  Your Cart
                </h1>
                <p className="text-stone-500 text-xs sm:text-sm mt-0.5 font-normal">
                  Good food brings people together.
                </p>
              </div>

              <Link
                href="/products"
                className="px-4 py-1.5 rounded-full border border-stone-300 hover:border-[#0F5638] text-xs font-semibold text-stone-700 hover:text-[#0F5638] transition-colors"
              >
                Continue Products
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
                        <h3 className="font-semibold text-xs sm:text-sm text-stone-900 truncate leading-snug">
                          {item.product.name}
                        </h3>
                        <p className="text-[14px] sm:text-xs text-stone-500 font-normal">{item.variant.weight}</p>
                        <p className="font-bold text-sm sm:text-base text-[#0F5638] mt-0.5 tracking-tight">
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

            {/* Subtotal, Shipping, Total Summary */}
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
                <span className="font-bold text-lg sm:text-xl text-[#0F5638] tracking-tight">₹{total}.00</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setShowCheckoutModal(true)}
                className="w-full py-3.5 sm:py-4 px-6 rounded-xl bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <span>→</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Checkout Address Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => !isSubmitting && setShowCheckoutModal(false)}
              disabled={isSubmitting}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 disabled:opacity-50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#0F5638] mb-1 tracking-tight leading-snug">
              Delivery Details
            </h3>
            <p className="text-xs text-stone-500 mb-4 font-normal">
              Enter your shipping address. Your order will be saved to our system and forwarded directly to WhatsApp.
            </p>

            {submitError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {submitError}
              </div>
            )}

            <form onSubmit={handleCheckoutSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-[#0F5638] disabled:bg-stone-100"
                  />
                </div>
                {formErrors.name && (
                  <p className="text-[12px] text-red-600 mt-1">{formErrors.name}</p>
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
                    required
                    disabled={isSubmitting}
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="e.g. 9847012345"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-[#0F5638] disabled:bg-stone-100"
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-[12px] text-red-600 mt-1">{formErrors.phone}</p>
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
                    required
                    disabled={isSubmitting}
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="e.g. 14/204 Spice Villa, MG Road"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-[#0F5638] disabled:bg-stone-100"
                  />
                </div>
                {formErrors.address && (
                  <p className="text-[12px] text-red-600 mt-1">{formErrors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="e.g. Kochi"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-[#0F5638] disabled:bg-stone-100"
                  />
                  {formErrors.city && (
                    <p className="text-[12px] text-red-600 mt-1">{formErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    disabled={isSubmitting}
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    placeholder="e.g. 682001"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-[#0F5638] disabled:bg-stone-100"
                  />
                  {formErrors.pincode && (
                    <p className="text-[12px] text-red-600 mt-1">{formErrors.pincode}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Delivery Notes (Optional)
                </label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="e.g. Near town hall"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-[#0F5638] disabled:bg-stone-100"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-5 sm:px-6 rounded-xl bg-[#0F5638] hover:bg-[#187A4F] text-white text-[12px] sm:text-[13px] font-bold uppercase tracking-wide flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving Order…</span>
                    </>
                  ) : (
                    <>
                      <img src="/assets/whatsapp-icon.png" alt="WhatsApp" className="w-5 h-5 object-contain shrink-0" />
                      <span className="text-center leading-tight">Place Order on WhatsApp (₹{total})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
