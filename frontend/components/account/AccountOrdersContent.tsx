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
import { useSocket, useSocketEvent } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/lib/socket/events';
import { SITE_SETTINGS } from '@/data/mockData';
import type { Order } from '@/types/api';

function isSameOrder(
  a?: { id?: string; _id?: string; orderNumber?: string } | null,
  b?: { id?: string; _id?: string; orderNumber?: string } | null
): boolean {
  if (!a || !b) return false;
  if (a.orderNumber && b.orderNumber && a.orderNumber === b.orderNumber) {
    return true;
  }
  const aId = a._id || a.id;
  const bId = b._id || b.id;
  if (aId && bId && String(aId) === String(bId)) {
    return true;
  }
  return false;
}

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
  const [orderIdInput, setOrderIdInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const whatsappCleanNumber = SITE_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '');

  // Pre-fill Order ID from URL if redirected from Checkout or link
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const urlOrderId = sp.get('orderId') || sp.get('order');
      if (urlOrderId) {
        setOrderIdInput(urlOrderId.trim().toUpperCase());
      }
    }
  }, []);

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
            const res = await trackOrders({
              orderId: ord.orderNumber,
              phone: ord.phone,
            });
            if (res && res.length > 0) {
              const latest = res[0];
              updatedList[i] = { ...ord, ...latest };
            }
          } catch {
            // ignore backend failures during auto-refresh
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
    if (list.length > 0) {
      const firstKey = list[0].id || (list[0] as any)._id || list[0].orderNumber;
      if (firstKey) {
        setExpandedOrders({ [firstKey]: true });
      }
    }
    refreshOrders(list);
  }, [loadLocalOrders, refreshOrders]);

  const { socket, isConnected } = useSocket();

  // Handle incoming real-time order updates via Socket.IO
  const handleOrderUpdate = useCallback(
    (data: { order?: Order }) => {
      const updatedOrder = data?.order;
      if (!updatedOrder) return;

      setOrders((prev) => {
        const nextList = prev.map((o) =>
          isSameOrder(o, updatedOrder) ? { ...o, ...updatedOrder } : o
        );
        saveOrdersLocally(nextList);
        return nextList;
      });
    },
    [saveOrdersLocally]
  );

  useSocketEvent(SOCKET_EVENTS.ORDER_STATUS_UPDATED, handleOrderUpdate);
  useSocketEvent(SOCKET_EVENTS.ORDER_UPDATED, handleOrderUpdate);

  // Subscribe socket to private order tracking rooms for all active customer orders
  useEffect(() => {
    if (!socket || !isConnected || orders.length === 0) return;

    const activeOrders = orders.filter(
      (o) => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled'
    );
    if (activeOrders.length === 0) return;

    activeOrders.forEach((ord) => {
      if (ord.orderNumber) {
        socket.emit(SOCKET_EVENTS.ORDER_TRACK, { orderNumber: ord.orderNumber });
      }
    });

    return () => {
      activeOrders.forEach((ord) => {
        if (ord.orderNumber) {
          socket.emit(SOCKET_EVENTS.ORDER_UNTRACK, { orderNumber: ord.orderNumber });
        }
      });
    };
  }, [socket, isConnected, orders]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = orderIdInput.trim();
    const cleanPhone = phoneInput.trim();

    if (!cleanId) {
      setSearchStatus('error');
      setSearchMessage('Please enter your Order ID (e.g. YN-2026-0001).');
      return;
    }
    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 7) {
      setSearchStatus('error');
      setSearchMessage('Please enter your registered mobile number for security verification.');
      return;
    }

    setIsSearching(true);
    setSearchMessage(null);
    setSearchStatus('idle');

    try {
      const results = await trackOrders({
        orderId: cleanId,
        phone: cleanPhone,
      });

      if (results && results.length > 0) {
        // Merge into orders list
        setOrders((prev) => {
          const merged = [...results];
          prev.forEach((p) => {
            const pKey = p.id || (p as any)._id || p.orderNumber;
            if (!merged.some((m) => (m.id || (m as any)._id || m.orderNumber) === pKey)) {
              merged.push(p);
            }
          });
          saveOrdersLocally(merged);
          return merged;
        });

        // Auto expand found order
        const targetKey = results[0].id || (results[0] as any)._id || results[0].orderNumber;
        if (targetKey) {
          setExpandedOrders((prev) => ({ ...prev, [targetKey]: true }));
        }

        setSearchStatus('success');
        setSearchMessage(`✓ Order ${results[0].orderNumber} verified and loaded successfully!`);
      } else {
        setSearchStatus('error');
        setSearchMessage(`No order found matching Order ID "${cleanId}". Please check your order details.`);
      }
    } catch (err: unknown) {
      setSearchStatus('error');
      const msg = err instanceof Error ? err.message : 'Unable to connect to order tracking server. Please check your details.';
      setSearchMessage(msg);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleExpand = (key: string) => {
    setExpandedOrders((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const buildWhatsAppChatUrl = (order: Order) => {
    const msg = `🌿 *YUMNEST ORDER SUPPORT* 🌿\nHello Yumnest Team! I would like to check the fulfillment status of my order:\n━━━━━━━━━━━━━━━━━━━━━\n📦 *Order Reference:* ${order.orderNumber}\n👤 *Customer:* ${order.customerName}\n💰 *Total:* ₹${order.totalAmount}\n━━━━━━━━━━━━━━━━━━━━━\nPlease provide tracking or delivery updates. Thank you! 🙏`;
    return `https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="bg-white min-h-[calc(100vh-80px)] py-6 sm:py-8 text-[#1C1917]">
      <div className="max-w-3xl mx-auto px-3.5 sm:px-6 space-y-5 sm:space-y-6">

        {/* 1. Clean Account Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0F5638] tracking-tight leading-tight">
              My Account &amp; Order Status
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Live delivery progress, order tracking, and order history.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => refreshOrders(orders)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              title="Refresh order statuses"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#0F5638]' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Status'}</span>
            </button>
          </div>
        </div>

        {/* 2. Secure Guest Order Lookup Form */}
        <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold text-stone-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-[#0F5638]" />
              <span>Track Guest Order (Any Device)</span>
            </h2>
            <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
              No Login Required
            </span>
          </div>

          <p className="text-xs text-stone-500 leading-relaxed">
            Enter your Order ID (from your confirmation or WhatsApp chat) and registered phone number to view live fulfillment updates.
          </p>

          <form onSubmit={handleSearch} className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="text"
                  required
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  placeholder="Order ID (e.g. YN-2026-0001)"
                  className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder-stone-400 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition uppercase"
                />
              </div>

              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Registered Mobile (e.g. 9847012345)"
                  className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder-stone-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5638]/20 focus:border-[#0F5638] transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <div className="text-[11px] text-stone-500 flex items-center gap-1">
                <span>🔒 Secure customer verification</span>
              </div>

              <button
                type="submit"
                disabled={isSearching || !orderIdInput.trim() || !phoneInput.trim()}
                className="h-10 px-5 rounded-full bg-[#0F5638] hover:bg-[#187A4F] disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shrink-0 shadow-2xs"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Track Order</span>
                )}
              </button>
            </div>
          </form>

          {searchMessage && (
            <div
              className={`text-xs font-medium rounded-xl p-3 border flex items-center gap-2 ${
                searchStatus === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {searchStatus === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{searchMessage}</span>
            </div>
          )}
        </div>

        {/* 3. Customer Orders List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm sm:text-base font-bold text-[#0F5638] tracking-tight flex items-center gap-2">
              <Package className="w-4 h-4 text-[#0F5638]" />
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
            <div className="bg-white rounded-2xl p-8 sm:p-12 border border-stone-200 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-7 h-7 stroke-[1.6]" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-bold text-stone-800 text-base sm:text-lg">No Orders Placed Yet</h3>
                <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                  Your order history and real-time delivery status will automatically appear here once you place an order.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-2xs transition"
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
                const orderKey = order.id || (order as any)._id || order.orderNumber;
                const isExpanded = !!expandedOrders[orderKey];
                const badge = getStatusBadge(order.orderStatus);
                const isCancelled = order.orderStatus?.toLowerCase() === 'cancelled';
                const currentStepIndex = getStepIndex(order.orderStatus);

                return (
                  <div
                    key={orderKey}
                    className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden transition-all duration-200"
                  >
                    {/* Order Card Top Bar */}
                    <div
                      onClick={() => toggleExpand(orderKey)}
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
                      <div className="px-5 py-5 sm:px-8 sm:py-6 bg-stone-50 border-b border-stone-100">
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

                        {/* Courier & Shipment Tracking Banner */}
                        {order.trackingNumber && (
                          <div className="p-4 rounded-2xl bg-[#EAF7EF] border border-[#A9E9C3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#0F6B47] text-white flex items-center justify-center shrink-0 shadow-2xs">
                                <Truck className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-extrabold text-[#0B4A33] text-sm flex items-center gap-2">
                                  <span>Dispatched via {order.courierName || 'Courier Partner'}</span>
                                </p>
                                <p className="text-[#14261D] mt-0.5 font-mono text-xs">
                                  Tracking No: <span className="font-bold">{order.trackingNumber}</span>
                                  {order.estimatedDelivery ? ` • Est. Delivery: ${order.estimatedDelivery}` : ''}
                                </p>
                              </div>
                            </div>
                            {order.trackingUrl ? (
                              <a
                                href={order.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F6B47] hover:bg-[#0B4A33] text-white font-bold text-xs shadow-2xs transition"
                              >
                                <span>Track Courier Online</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <span className="text-[11px] text-[#0F6B47] font-semibold">
                                Parcel Dispatched
                              </span>
                            )}
                          </div>
                        )}

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
                          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/60 space-y-1.5 text-xs text-stone-600">
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
                          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/60 space-y-2 text-xs">
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
        <div className="bg-stone-50 rounded-2xl p-5 sm:p-6 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
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
            className="px-5 py-2.5 rounded-full bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors shrink-0"
          >
            Chat with Support
          </a>
        </div>

      </div>
    </div>
  );
};

export default AccountOrdersContent;
