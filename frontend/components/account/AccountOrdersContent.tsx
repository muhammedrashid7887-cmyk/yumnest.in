'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  MapPin,
  Phone,
  User,
  ArrowRight,
} from 'lucide-react';
import { trackOrders } from '@/lib/api/orders';
import { SITE_SETTINGS } from '@/data/mockData';
import type { Order } from '@/types/api';

const ORDER_STORAGE_KEY = 'yumnest_customer_orders';

// Order Status Steps definition
const STEPS = [
  { key: 'placed', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'processing', label: 'Packed & Processing', icon: Package },
  { key: 'shipped', label: 'Shipped / Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

function getStepIndex(status: string): number {
  switch (status.toLowerCase()) {
    case 'new':
    case 'pending':
      return 0;
    case 'confirmed':
      return 1;
    case 'processing':
      return 2;
    case 'shipped':
    case 'out_for_delivery':
      return 3;
    case 'delivered':
      return 4;
    default:
      return 0;
  }
}

function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case 'new':
      return { label: 'Order Received', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
    case 'pending':
      return { label: 'Pending Confirmation', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
    case 'confirmed':
      return { label: 'Order Confirmed', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
    case 'processing':
      return { label: 'Packing & Processing', bg: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
    case 'shipped':
      return { label: 'Shipped', bg: 'bg-purple-100 text-purple-800 border-purple-300' };
    case 'out_for_delivery':
      return { label: 'Out for Delivery', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    case 'delivered':
      return { label: 'Delivered', bg: 'bg-green-100 text-green-900 border-green-300' };
    case 'cancelled':
      return { label: 'Cancelled', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
    default:
      return { label: status, bg: 'bg-stone-100 text-stone-800 border-stone-200' };
  }
}

function formatDate(dateInput?: string | Date) {
  if (!dateInput) return 'Recently';
  try {
    const d = new Date(dateInput);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(dateInput);
  }
}

export const AccountOrdersContent: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const whatsappCleanNumber = SITE_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '');

  // Load orders stored in browser
  const loadLocalOrders = useCallback((): Order[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(ORDER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  }, []);

  const saveOrdersLocally = useCallback((newOrders: Order[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(newOrders.slice(0, 30)));
    } catch (e) {
      console.warn('Failed to save orders locally:', e);
    }
  }, []);

  // Sync latest status from backend
  const refreshOrders = useCallback(async (currentList: Order[]) => {
    if (currentList.length === 0) return;
    setIsRefreshing(true);
    try {
      const updatedList = [...currentList];
      for (let i = 0; i < Math.min(updatedList.length, 5); i++) {
        const ord = updatedList[i];
        if (ord.orderNumber) {
          try {
            const res = await trackOrders(ord.orderNumber);
            if (res && res.length > 0) {
              const latest = res[0];
              updatedList[i] = { ...ord, ...latest };
            }
          } catch {
            // ignore backend failures
          }
        }
      }
      setOrders(updatedList);
      saveOrdersLocally(updatedList);
    } finally {
      setIsRefreshing(false);
    }
  }, [saveOrdersLocally]);

  useEffect(() => {
    const list = loadLocalOrders();
    setOrders(list);
    // Auto expand the first order if exists
    if (list.length > 0 && list[0].id) {
      setExpandedOrders({ [list[0].id]: true });
    }
    refreshOrders(list);
  }, [loadLocalOrders, refreshOrders]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchMessage(null);
    try {
      const results = await trackOrders(query);
      if (results && results.length > 0) {
        // Merge into orders list
        setOrders((prev) => {
          const merged = [...results];
          prev.forEach((p) => {
            if (!merged.some((m) => m.id === p.id || m.orderNumber === p.orderNumber)) {
              merged.push(p);
            }
          });
          saveOrdersLocally(merged);
          return merged;
        });
        // Auto expand found order
        if (results[0].id) {
          setExpandedOrders((prev) => ({ ...prev, [results[0].id]: true }));
        }
        setSearchMessage(`Found ${results.length} order(s) for "${query}".`);
      } else {
        setSearchMessage(`No orders found matching "${query}". Please check your order reference number or mobile number.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to connect to order tracking server. Please try again or chat with us on WhatsApp.';
      setSearchMessage(msg);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const buildWhatsAppChatUrl = (order: Order) => {
    const msg = `🌿 *YUMNEST ORDER SUPPORT* 🌿\nHello Yumnest Team! I would like to check the fulfillment status of my order:\n━━━━━━━━━━━━━━━━━━━━━\n📦 *Order Reference:* ${order.orderNumber}\n👤 *Customer:* ${order.customerName}\n💰 *Total:* ₹${order.totalAmount}\n━━━━━━━━━━━━━━━━━━━━━\nPlease provide tracking or delivery updates. Thank you! 🙏`;
    return `https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="bg-[#FBF9F5] min-h-[calc(100vh-80px)] py-6 sm:py-10 text-[#1C1917]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">

        {/* 1. Account Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DFC8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0F5638]/10 text-[#0F5638] flex items-center justify-center shrink-0 border border-[#0F5638]/15 shadow-2xs">
              <User className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#E8AA42]">Customer Portal</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0F5638] tracking-tight leading-tight">
                My Account &amp; Order Status
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                Live delivery progress, order tracking, and spice basket history.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => refreshOrders(orders)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-all cursor-pointer hover-btn-smooth disabled:opacity-50"
              title="Refresh order statuses"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#0F5638]' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Status'}</span>
            </button>
          </div>
        </div>

        {/* 2. Order Lookup Search Box */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8DFC8] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Search className="w-4 h-4 text-[#0F5638]" />
              <span>Track Any Order with Phone or Order ID</span>
            </h2>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Order ID (e.g. YN-2026-0001) or 10-digit Mobile Number"
                className="w-full h-11 sm:h-12 pl-4 pr-10 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 placeholder-stone-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5638] focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchMessage(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="h-11 sm:h-12 px-6 rounded-xl bg-[#0F5638] hover:bg-[#187A4F] disabled:opacity-40 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer hover-btn-smooth shrink-0"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Track Order</span>
                </>
              )}
            </button>
          </form>

          {searchMessage && (
            <p className="text-xs font-medium text-stone-600 bg-stone-50 border border-stone-200/80 rounded-lg p-2.5">
              {searchMessage}
            </p>
          )}
        </div>

        {/* 3. Customer Orders List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base sm:text-lg font-extrabold text-[#0F5638] tracking-tight flex items-center gap-2">
              <Package className="w-5 h-5 text-[#0F5638]" />
              <span>Your Orders ({orders.length})</span>
            </h2>
            <Link
              href="/products"
              className="text-xs font-bold text-[#0F5638] hover:underline inline-flex items-center gap-1"
            >
              <span>Shop More Spices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8DFC8] text-center shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto shadow-inner">
                <ShoppingBag className="w-8 h-8 stroke-[1.6]" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="font-bold text-stone-800 text-base sm:text-lg">No Orders Placed Yet</h3>
                <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                  Your order history and real-time delivery status will automatically appear here once you place an order.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-sm transition-all hover-btn-smooth"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* Orders Card Stack */
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = !!expandedOrders[order.id];
                const badge = getStatusBadge(order.orderStatus);
                const isCancelled = order.orderStatus?.toLowerCase() === 'cancelled';
                const currentStepIndex = getStepIndex(order.orderStatus);

                return (
                  <div
                    key={order.id || order.orderNumber}
                    className="bg-white rounded-3xl border border-[#E8DFC8] shadow-xs overflow-hidden transition-all duration-200"
                  >
                    {/* Order Card Top Bar */}
                    <div
                      onClick={() => order.id && toggleExpand(order.id)}
                      className="p-5 sm:p-6 cursor-pointer hover:bg-stone-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono font-black text-base sm:text-lg text-[#0F5638] tracking-tight">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                          <span>Placed on: {formatDate(order.createdAt)}</span>
                          <span>•</span>
                          <span>Customer: <strong className="text-stone-700">{order.customerName}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wider">Total Amount</p>
                          <p className="text-base sm:text-lg font-black text-[#0F5638]">
                            ₹{order.totalAmount}.00
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Order Status Stepper */}
                    {!isCancelled && (
                      <div className="px-5 py-5 sm:px-8 sm:py-6 bg-[#FAF8F5] border-b border-stone-100">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-4">
                          Fulfillment &amp; Delivery Progress
                        </p>

                        <div className="relative">
                          {/* Progress Line */}
                          <div className="absolute top-4 left-4 right-4 h-1 bg-stone-200 -z-0 hidden sm:block">
                            <div
                              className="h-full bg-[#0F5638] transition-all duration-500 rounded-full"
                              style={{
                                width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
                              }}
                            />
                          </div>

                          {/* Stepper Dots */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-2 relative z-10">
                            {STEPS.map((step, idx) => {
                              const isCompleted = idx <= currentStepIndex;
                              const isCurrent = idx === currentStepIndex;
                              const IconComponent = step.icon;

                              return (
                                <div
                                  key={step.key}
                                  className="flex sm:flex-col items-center sm:text-center gap-2.5 sm:gap-1.5"
                                >
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${
                                      isCompleted
                                        ? 'bg-[#0F5638] border-[#0F5638] text-white shadow-2xs'
                                        : 'bg-white border-stone-300 text-stone-400'
                                    } ${isCurrent ? 'ring-4 ring-[#0F5638]/20 scale-105' : ''}`}
                                  >
                                    <IconComponent className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p
                                      className={`text-xs font-bold leading-tight ${
                                        isCompleted ? 'text-[#0F5638]' : 'text-stone-400'
                                      }`}
                                    >
                                      {step.label}
                                    </p>
                                    {isCurrent && (
                                      <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                                        Current Stage
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {isCancelled && (
                      <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-2 text-xs text-red-800">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>This order was cancelled. If you have questions, please reach out via WhatsApp support.</span>
                      </div>
                    )}

                    {/* Order Details Body (Collapsible) */}
                    {isExpanded && (
                      <div className="p-5 sm:p-6 space-y-5 animate-in fade-in duration-200">

                        {/* Items Ordered List */}
                        <div className="space-y-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                            Ordered Items ({order.items.reduce((s, it) => s + it.quantity, 0)})
                          </p>
                          <div className="divide-y divide-stone-100 border border-stone-200/80 rounded-2xl bg-white overflow-hidden">
                            {order.items.map((it, idx) => (
                              <div
                                key={idx}
                                className="p-3 sm:p-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm"
                              >
                                <div>
                                  <p className="font-bold text-stone-900">{it.productName}</p>
                                  <p className="text-xs text-stone-500">
                                    Qty: {it.quantity} × ₹{it.unitPrice}
                                  </p>
                                </div>
                                <span className="font-extrabold text-stone-800 whitespace-nowrap">
                                  ₹{it.totalPrice || it.unitPrice * it.quantity}.00
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Breakdown & Address Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Shipping Address */}
                          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200/60 space-y-1.5 text-xs text-stone-600">
                            <p className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-2">
                              <MapPin className="w-3.5 h-3.5 text-[#0F5638]" />
                              <span>Delivery Address</span>
                            </p>
                            <p className="font-semibold text-stone-900">{order.customerName}</p>
                            <p>{order.address}</p>
                            <p>{order.city}, Kerala - {order.pincode}</p>
                            <p className="flex items-center gap-1 text-stone-700 pt-1">
                              <Phone className="w-3 h-3 text-stone-400" />
                              <span>{order.phone}</span>
                            </p>
                          </div>

                          {/* Pricing Summary */}
                          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200/60 space-y-2 text-xs">
                            <p className="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-2">
                              Payment &amp; Billing
                            </p>
                            <div className="flex justify-between text-stone-500">
                              <span>Subtotal</span>
                              <span>₹{order.subtotal}.00</span>
                            </div>
                            <div className="flex justify-between text-stone-500">
                              <span>Delivery Fee</span>
                              <span>{order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}.00`}</span>
                            </div>
                            <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-stone-900 text-sm">
                              <span>Total Amount</span>
                              <span className="text-[#0F5638] font-black">₹{order.totalAmount}.00</span>
                            </div>
                            <div className="text-[11px] text-stone-500 pt-1 flex items-center justify-between">
                              <span>Payment Mode:</span>
                              <span className="font-semibold text-stone-700">{order.paymentMethod || 'WhatsApp COD'}</span>
                            </div>
                          </div>

                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex flex-wrap items-center gap-3">
                          <a
                            href={buildWhatsAppChatUrl(order)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer hover-btn-smooth"
                          >
                            <img src="/assets/whatsapp-icon.png" alt="WhatsApp" className="w-4 h-4 object-contain" />
                            <span>Ask WhatsApp Updates</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <Link
                            href="/products"
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 hover:border-[#0F5638] text-stone-700 hover:text-[#0F5638] text-xs font-semibold uppercase tracking-wider transition-colors"
                          >
                            <span>Buy More Spices</span>
                          </Link>
                        </div>

                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Need Help / Store Support Box */}
        <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-[#E8DFC8] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-stone-900 text-sm sm:text-base">
              Need assistance with an existing order?
            </h3>
            <p className="text-xs text-stone-500">
              Our direct customer support team in Kochi, Kerala is available Monday to Saturday, 9:00 AM - 7:00 PM IST.
            </p>
          </div>

          <a
            href={`https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent('🌿 Hello Yumnest Support! I need help with an order inquiry. ✨')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors shrink-0"
          >
            Chat with Support
          </a>
        </div>

      </div>
    </div>
  );
};

export default AccountOrdersContent;
