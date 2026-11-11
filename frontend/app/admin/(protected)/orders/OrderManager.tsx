'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import {
  fetchOrders,
  fetchOrderStats,
  updateOrderStatus,
  updateOrderDetails,
} from '@/lib/api/orders';
import type { Order, OrderStatus, OrderStats } from '@/types/api';
import { useAdminSocket, useSocketEvent } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/lib/socket/events';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  ExternalLink,
  MessageCircle,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
  X,
  Edit2,
  Save,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; badgeClass: string; bgTile: string; textColor: string }
> = {
  new: {
    label: 'New',
    badgeClass: 'bg-[#0F7A4D] text-white',
    bgTile: 'bg-[#E3F2EA]',
    textColor: 'text-[#0F6B47]',
  },
  pending: {
    label: 'Pending',
    badgeClass: 'bg-[#FDF0D4] text-[#8F5F08]',
    bgTile: 'bg-[#FEF6E6]',
    textColor: 'text-[#8F5F08]',
  },
  confirmed: {
    label: 'Confirmed',
    badgeClass: 'bg-[#E7E0FA] text-[#593EAE]',
    bgTile: 'bg-[#F3EFFC]',
    textColor: 'text-[#593EAE]',
  },
  processing: {
    label: 'Processing',
    badgeClass: 'bg-[#DCE9FB] text-[#1D57A3]',
    bgTile: 'bg-[#EDF4FD]',
    textColor: 'text-[#1D57A3]',
  },
  shipped: {
    label: 'Shipped',
    badgeClass: 'bg-[#E0F2FE] text-[#0369A1]',
    bgTile: 'bg-[#F0F9FF]',
    textColor: 'text-[#0369A1]',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    badgeClass: 'bg-[#FEF3C7] text-[#92400E]',
    bgTile: 'bg-[#FFFBEB]',
    textColor: 'text-[#92400E]',
  },
  delivered: {
    label: 'Delivered',
    badgeClass: 'bg-[#D8F0E0] text-[#17673A]',
    bgTile: 'bg-[#EAF7EF]',
    textColor: 'text-[#17673A]',
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-[#FBE1E1] text-[#A02A2A]',
    bgTile: 'bg-[#FDF0F0]',
    textColor: 'text-[#A02A2A]',
  },
};

const ALL_STATUSES: OrderStatus[] = [
  'new',
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

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

function formatOrderDate(dateInput?: string | Date): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return '—';
  }
}

function formatOrderDateTime(dateInput?: string | Date): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${hours}:${mins}`;
  } catch {
    return '—';
  }
}

export default function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'totalAmount' | 'orderNumber'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);

  // Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [editCustomerForm, setEditCustomerForm] = useState({
    customerName: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    deliveryNotes: '',
  });

  // Tracking details state
  const [trackingForm, setTrackingForm] = useState({
    courierName: '',
    trackingNumber: '',
    trackingUrl: '',
    estimatedDelivery: '',
  });
  const [isSavingTracking, setIsSavingTracking] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load orders & stats
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        fetchOrders({
          page,
          limit: 15,
          search: search.trim() || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
          sortBy,
          sortOrder,
        }),
        fetchOrderStats(),
      ]);

      setOrders(ordersRes.data || []);
      setTotalPages(ordersRes.meta?.pages || 1);
      setTotalOrdersCount(ordersRes.meta?.total || 0);
      setStats(statsRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load orders.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Join authenticated admin room for instant live order dispatch
  useAdminSocket();

  // Socket.IO: Prepend newly placed customer orders live without refresh
  useSocketEvent(SOCKET_EVENTS.ORDER_CREATED, (data: { order?: Order }) => {
    const newOrder = data?.order;
    if (!newOrder) return;
    setOrders((prev) => {
      if (prev.some((o) => isSameOrder(o, newOrder))) return prev;
      return [newOrder, ...prev];
    });
    setTotalOrdersCount((prev) => prev + 1);
    fetchOrderStats().then(setStats).catch(() => {});
    showToast(`New order #${newOrder.orderNumber} placed by ${newOrder.customerName || 'Customer'}!`);
  });

  // Socket.IO: Update order rows in-place when status changes
  useSocketEvent(SOCKET_EVENTS.ORDER_STATUS_UPDATED, (data: { order?: Order }) => {
    const updated = data?.order;
    if (!updated) return;
    setOrders((prev) => prev.map((o) => (isSameOrder(o, updated) ? { ...o, ...updated } : o)));
    setSelectedOrder((cur) => (cur && isSameOrder(cur, updated) ? { ...cur, ...updated } : cur));
    fetchOrderStats().then(setStats).catch(() => {});
  });

  // Socket.IO: Update order rows in-place when tracking/details change
  useSocketEvent(SOCKET_EVENTS.ORDER_UPDATED, (data: { order?: Order }) => {
    const updated = data?.order;
    if (!updated) return;
    setOrders((prev) => prev.map((o) => (isSameOrder(o, updated) ? { ...o, ...updated } : o)));
    setSelectedOrder((cur) => (cur && isSameOrder(cur, updated) ? { ...cur, ...updated } : cur));
  });

  // Handle instant status change with row-level tracking
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const updated = await updateOrderStatus(orderId, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (isSameOrder(o, updated) ? { ...o, ...updated } : o))
      );
      if (selectedOrder && isSameOrder(selectedOrder, updated)) {
        setSelectedOrder((prev) => (prev ? { ...prev, ...updated } : null));
      }
      showToast(`Order #${updated.orderNumber} updated to ${STATUS_CONFIG[newStatus].label}`);
      // Refresh stats in background
      fetchOrderStats().then(setStats).catch(() => {});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update order status.';
      alert(msg);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Save Admin Notes
  const handleSaveNotes = async () => {
    if (!selectedOrder) return;
    const targetId = selectedOrder._id || selectedOrder.id || selectedOrder.orderNumber;
    setIsSavingNotes(true);
    try {
      const updated = await updateOrderDetails(targetId, {
        adminNotes: adminNoteInput,
      });
      setSelectedOrder((prev) => (prev ? { ...prev, ...updated } : null));
      setOrders((prev) =>
        prev.map((o) => (isSameOrder(o, updated) ? { ...o, ...updated } : o))
      );
      showToast('Admin notes saved successfully');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save admin notes';
      alert(msg);
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Save Customer Details Edit
  const handleSaveCustomerDetails = async () => {
    if (!selectedOrder) return;
    const targetId = selectedOrder._id || selectedOrder.id || selectedOrder.orderNumber;
    try {
      const updated = await updateOrderDetails(targetId, {
        customerName: editCustomerForm.customerName.trim(),
        phone: editCustomerForm.phone.trim(),
        address: editCustomerForm.address.trim(),
        city: editCustomerForm.city.trim(),
        pincode: editCustomerForm.pincode.trim(),
        deliveryNotes: editCustomerForm.deliveryNotes.trim(),
      });
      setSelectedOrder((prev) => (prev ? { ...prev, ...updated } : null));
      setOrders((prev) =>
        prev.map((o) => (isSameOrder(o, updated) ? { ...o, ...updated } : o))
      );
      setIsEditingCustomer(false);
      showToast('Customer details updated');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update customer details';
      alert(msg);
    }
  };

  // Save Shipment & Courier Tracking Details
  const handleSaveTracking = async () => {
    if (!selectedOrder) return;
    const targetId = selectedOrder._id || selectedOrder.id || selectedOrder.orderNumber;
    setIsSavingTracking(true);
    try {
      const updated = await updateOrderDetails(targetId, {
        courierName: trackingForm.courierName.trim() || undefined,
        trackingNumber: trackingForm.trackingNumber.trim() || undefined,
        trackingUrl: trackingForm.trackingUrl.trim() || undefined,
        estimatedDelivery: trackingForm.estimatedDelivery.trim() || undefined,
      });
      setSelectedOrder((prev) => (prev ? { ...prev, ...updated } : null));
      setOrders((prev) =>
        prev.map((o) => (isSameOrder(o, updated) ? { ...o, ...updated } : o))
      );
      showToast('Shipment & tracking details saved successfully');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save tracking details';
      alert(msg);
    } finally {
      setIsSavingTracking(false);
    }
  };

  // Open detail modal
  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setAdminNoteInput(order.adminNotes || '');
    setIsEditingCustomer(false);
    setEditCustomerForm({
      customerName: order.customerName,
      phone: order.phone,
      address: order.address,
      city: order.city,
      pincode: order.pincode,
      deliveryNotes: order.deliveryNotes || '',
    });
    setTrackingForm({
      courierName: order.courierName || '',
      trackingNumber: order.trackingNumber || '',
      trackingUrl: order.trackingUrl || '',
      estimatedDelivery: order.estimatedDelivery || '',
    });
  };

  // Helper to build WhatsApp direct link for customer
  const getCustomerWhatsAppUrl = (order: Order) => {
    const cleanPhone = order.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('91')
      ? cleanPhone
      : cleanPhone.length === 10
      ? `91${cleanPhone}`
      : cleanPhone;

    const message = `Hello ${order.customerName}, regarding your Yum Nest order #${order.orderNumber} (₹${order.totalAmount}). Status: ${STATUS_CONFIG[order.orderStatus].label}.`;
    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6">

      {/* ── Toast notification ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B4A33] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#A9E9C3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-2xl font-extrabold text-[#14261D] tracking-tight">
            Order Management
          </h1>
          <p className="text-xs sm:text-sm text-[#66766D] mt-0.5">
            Real database records from customer WhatsApp checkouts. Update statuses manually using the dropdown.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E3E9E5] text-xs font-semibold text-[#14261D] hover:bg-stone-50 shadow-2xs transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#0F6B47] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── Stats Tiles (Matching HTML Reference) ─────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Orders */}
        <div className="bg-white rounded-2xl border border-[#E3E9E5] p-4 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-[#E3F2EA] text-[#0F6B47] flex items-center justify-center mb-3">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-[#66766D] block">Total Orders</span>
          <div className="text-2xl font-black text-[#14261D] tracking-tight mt-1">
            {stats?.total ?? 0}
          </div>
          <span className="text-[11px] text-[#0F6B47] font-semibold mt-1 block">
            {stats?.byStatus?.new ?? 0} new waiting
          </span>
        </div>

        {/* Total Sales */}
        <div className="bg-white rounded-2xl border border-[#E3E9E5] p-4 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-[#FEF6E6] text-[#C47A10] flex items-center justify-center mb-3">
            <span className="text-base font-extrabold">₹</span>
          </div>
          <span className="text-xs font-semibold text-[#66766D] block">Total Sales</span>
          <div className="text-2xl font-black text-[#14261D] tracking-tight mt-1">
            ₹{Number(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#66766D] font-medium mt-1 block">
            Confirmed & completed orders
          </span>
        </div>

        {/* Processing & In Delivery */}
        <div className="bg-white rounded-2xl border border-[#E3E9E5] p-4 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-[#EDF4FD] text-[#2F6BD1] flex items-center justify-center mb-3">
            <Truck className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-[#66766D] block">In Transit / Processing</span>
          <div className="text-2xl font-black text-[#14261D] tracking-tight mt-1">
            {(stats?.byStatus?.processing ?? 0) + (stats?.byStatus?.shipped ?? 0) + (stats?.byStatus?.out_for_delivery ?? 0)}
          </div>
          <span className="text-[11px] text-[#2F6BD1] font-semibold mt-1 block">
            {stats?.byStatus?.shipped ?? 0} dispatched
          </span>
        </div>

        {/* Delivered */}
        <div className="bg-white rounded-2xl border border-[#E3E9E5] p-4 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-[#EAF7EF] text-[#17673A] flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-[#66766D] block">Delivered Orders</span>
          <div className="text-2xl font-black text-[#14261D] tracking-tight mt-1">
            {stats?.byStatus?.delivered ?? 0}
          </div>
          <span className="text-[11px] text-[#17673A] font-semibold mt-1 block">
            Successfully fulfilled
          </span>
        </div>

      </div>

      {/* ── Status Breakdown Bar ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E3E9E5] p-3 sm:p-4 shadow-sm flex flex-wrap items-center gap-2 text-xs">
        <span className="font-bold text-[#14261D] mr-1">Status Counts:</span>
        {ALL_STATUSES.map((status) => {
          const count = stats?.byStatus?.[status] ?? 0;
          return (
            <button
              key={status}
              type="button"
              onClick={() => {
                setStatusFilter(statusFilter === status ? 'all' : status);
                setPage(1);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition cursor-pointer border ${
                statusFilter === status
                  ? 'border-[#0F6B47] bg-[#E3F2EA] text-[#0F6B47]'
                  : 'border-[#E3E9E5] bg-stone-50 text-[#66766D] hover:bg-stone-100'
              }`}
            >
              <span>{STATUS_CONFIG[status].label}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white text-[10px] font-bold shadow-2xs">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Toolbar: Search, Filters & Sorting ────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E3E9E5] p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#66766D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Order ID, customer name, or phone…"
            className="w-full pl-10 pr-4 py-2 bg-[#F3F6F4] border border-[#E3E9E5] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0F6B47] text-[#14261D]"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-[#F3F6F4] border border-[#E3E9E5] rounded-xl text-xs font-semibold text-[#14261D] focus:outline-none focus:border-[#0F6B47]"
          >
            <option value="all">All Statuses</option>
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                {STATUS_CONFIG[st].label}
              </option>
            ))}
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-') as [
                'createdAt' | 'totalAmount' | 'orderNumber',
                'asc' | 'desc'
              ];
              setSortBy(sb);
              setSortOrder(so);
              setPage(1);
            }}
            className="px-3 py-2 bg-[#F3F6F4] border border-[#E3E9E5] rounded-xl text-xs font-semibold text-[#14261D] focus:outline-none focus:border-[#0F6B47]"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="totalAmount-desc">Amount: High to Low</option>
            <option value="totalAmount-asc">Amount: Low to High</option>
            <option value="orderNumber-desc">Order ID: Descending</option>
          </select>
        </div>

      </div>

      {/* ── Orders Table ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E3E9E5] shadow-sm overflow-hidden">
        
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#0F6B47] animate-spin mx-auto" />
            <p className="text-xs font-semibold text-[#66766D]">Loading orders from MongoDB…</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center space-y-3 px-4">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-sm font-bold text-red-700">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-1.5 rounded-lg bg-[#0F6B47] text-white text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-full bg-[#E3F2EA] text-[#0F6B47] flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#14261D]">No orders found</h3>
            <p className="text-xs text-[#66766D] max-w-sm mx-auto">
              {search || statusFilter !== 'all'
                ? 'No orders match your filter criteria. Clear search or filters to see all orders.'
                : 'Customer orders placed through the website will appear here in real time.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E3E9E5] bg-[#F7FAF8] text-[#66766D] font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E9E5] text-[#14261D]">
                {orders.map((order) => {
                  const statusConf = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.new;
                  const dateStr = formatOrderDate(order.createdAt);
                  const totalItems = order.items.reduce((acc, it) => acc + it.quantity, 0);

                  return (
                    <tr
                      key={order.orderNumber || order._id || order.id}
                      className="hover:bg-[#F7FAF8] transition group cursor-pointer"
                      onClick={() => openOrderModal(order)}
                    >
                      {/* Order ID */}
                      <td className="py-3 px-4 font-mono font-bold text-[#0B4A33] whitespace-nowrap">
                        <div>#{order.orderNumber}</div>
                        {order.trackingNumber && (
                          <div className="text-[10px] text-[#0F6B47] font-sans font-semibold flex items-center gap-1 mt-0.5">
                            <Truck className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[130px]" title={`${order.courierName || 'Courier'}: ${order.trackingNumber}`}>
                              {order.courierName ? `${order.courierName}: ` : ''}{order.trackingNumber}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4 font-semibold text-[#14261D] whitespace-nowrap">
                        {order.customerName}
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 font-mono text-[#66766D] whitespace-nowrap">
                        {order.phone}
                      </td>

                      {/* Items */}
                      <td className="py-3 px-4 text-[#66766D]">
                        <span className="font-semibold text-[#14261D]">
                          {totalItems} {totalItems === 1 ? 'item' : 'items'}
                        </span>
                        <span className="block text-[11px] truncate max-w-[160px] text-[#66766D]">
                          {order.items.map((i) => i.productName).join(', ')}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-4 font-bold text-stone-900 whitespace-nowrap">
                        ₹{order.totalAmount}.00
                      </td>

                      {/* Payment */}
                      <td className="py-3 px-4 text-[#66766D] whitespace-nowrap">
                        <span className="text-[11px] font-medium">{order.paymentMethod}</span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-[#66766D] whitespace-nowrap font-mono text-[11px]">
                        {dateStr}
                      </td>

                      {/* Manual Status Dropdown */}
                      <td
                        className="py-3 px-4 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()} // Prevent row click
                      >
                        <select
                          value={order.orderStatus}
                          onChange={(e) =>
                            handleStatusChange(order._id || order.id || order.orderNumber, e.target.value as OrderStatus)
                          }
                          disabled={updatingOrderId === (order._id || order.id || order.orderNumber)}
                          aria-label={`Change status for order #${order.orderNumber}`}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition focus:outline-none cursor-pointer ${statusConf.badgeClass} disabled:opacity-50`}
                        >
                          {ALL_STATUSES.map((st) => (
                            <option
                              key={st}
                              value={st}
                              className="bg-white text-stone-900 font-semibold"
                            >
                              {STATUS_CONFIG[st].label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp Direct Chat */}
                          <a
                            href={getCustomerWhatsAppUrl(order)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#E3F2EA] hover:bg-[#D0EBDD] text-[#0F6B47] transition cursor-pointer"
                            title="Chat with customer on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          {/* View details */}
                          <button
                            type="button"
                            onClick={() => openOrderModal(order)}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#14261D] font-semibold text-xs transition cursor-pointer"
                          >
                            Details
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#E3E9E5] bg-[#F7FAF8] flex items-center justify-between text-xs text-[#66766D]">
            <span>
              Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, totalOrdersCount)} of {totalOrdersCount} orders
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-[#E3E9E5] bg-white font-semibold disabled:opacity-40 hover:bg-stone-50"
              >
                Previous
              </button>
              <span className="font-bold text-[#14261D]">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-[#E3E9E5] bg-white font-semibold disabled:opacity-40 hover:bg-stone-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── Detailed Order View Modal ────────────────────────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081811]/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E3E9E5] max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E3E9E5]">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xl sm:text-2xl font-black text-[#0B4A33]">
                    #{selectedOrder.orderNumber}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      STATUS_CONFIG[selectedOrder.orderStatus]?.badgeClass
                    }`}
                  >
                    {STATUS_CONFIG[selectedOrder.orderStatus]?.label}
                  </span>
                </div>
                <p className="text-xs text-[#66766D] mt-1">
                  Placed on {formatOrderDateTime(selectedOrder.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Updater inside Modal */}
            <div className="p-4 rounded-2xl bg-[#F7FAF8] border border-[#E3E9E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-[#14261D] block">Update Status</span>
                <span className="text-[11px] text-[#66766D]">Select a new status to record in history</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) =>
                    handleStatusChange(
                      selectedOrder._id || selectedOrder.id || selectedOrder.orderNumber,
                      e.target.value as OrderStatus
                    )
                  }
                  className="px-3 py-1.5 rounded-xl border border-[#E3E9E5] bg-white font-bold text-xs text-[#14261D] shadow-2xs"
                >
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {STATUS_CONFIG[st].label}
                    </option>
                  ))}
                </select>
                <a
                  href={getCustomerWhatsAppUrl(selectedOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs shadow-2xs transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Chat</span>
                </a>
              </div>
            </div>

            {/* Customer Details Box */}
            <div className="p-4 rounded-2xl border border-[#E3E9E5] bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#66766D] flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#0F6B47]" />
                  <span>Customer & Delivery Details</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditingCustomer(!isEditingCustomer)}
                  className="text-xs font-semibold text-[#0F6B47] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{isEditingCustomer ? 'Cancel' : 'Edit Details'}</span>
                </button>
              </div>

              {isEditingCustomer ? (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-[#66766D]">Customer Name</label>
                      <input
                        type="text"
                        value={editCustomerForm.customerName}
                        onChange={(e) =>
                          setEditCustomerForm({ ...editCustomerForm, customerName: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E3E9E5]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#66766D]">Phone Number</label>
                      <input
                        type="tel"
                        value={editCustomerForm.phone}
                        onChange={(e) =>
                          setEditCustomerForm({ ...editCustomerForm, phone: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E3E9E5]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#66766D]">Delivery Address</label>
                    <input
                      type="text"
                      value={editCustomerForm.address}
                      onChange={(e) =>
                        setEditCustomerForm({ ...editCustomerForm, address: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E3E9E5]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-[#66766D]">City</label>
                      <input
                        type="text"
                        value={editCustomerForm.city}
                        onChange={(e) =>
                          setEditCustomerForm({ ...editCustomerForm, city: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E3E9E5]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#66766D]">PIN Code</label>
                      <input
                        type="text"
                        value={editCustomerForm.pincode}
                        onChange={(e) =>
                          setEditCustomerForm({ ...editCustomerForm, pincode: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E3E9E5]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleSaveCustomerDetails}
                      className="px-4 py-1.5 rounded-lg bg-[#0F6B47] text-white text-xs font-bold"
                    >
                      Save Customer Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#66766D] block">Name:</span>
                    <span className="font-bold text-[#14261D]">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[#66766D] block">Phone:</span>
                    <span className="font-mono font-bold text-[#14261D]">{selectedOrder.phone}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[#66766D] block">Address:</span>
                    <span className="font-medium text-[#14261D]">
                      {selectedOrder.address}, {selectedOrder.city} – {selectedOrder.pincode}
                    </span>
                  </div>
                  {selectedOrder.deliveryNotes && (
                    <div className="sm:col-span-2 p-2.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-amber-900 text-xs">
                      <span className="font-bold">Customer Notes: </span>
                      {selectedOrder.deliveryNotes}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Courier & Shipment Tracking Box */}
            <div className="p-4 rounded-2xl border border-[#E3E9E5] bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#66766D] flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#0F6B47]" />
                  <span>Courier &amp; Shipment Tracking</span>
                </h3>
                {selectedOrder.trackingNumber && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E3F2EA] text-[#0F6B47] text-[10px] font-bold">
                    Tracking Assigned
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-[#66766D] block mb-1">Courier Service</label>
                  <select
                    value={trackingForm.courierName}
                    onChange={(e) => {
                      const courier = e.target.value;
                      setTrackingForm((prev) => ({
                        ...prev,
                        courierName: courier,
                      }));
                    }}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E3E9E5] bg-[#FAF8F5] font-semibold text-[#14261D] focus:outline-none focus:border-[#0F6B47]"
                  >
                    <option value="">Select Carrier...</option>
                    <option value="DTDC">DTDC Express</option>
                    <option value="ST Courier">ST Courier</option>
                    <option value="India Post">India Post / Speed Post</option>
                    <option value="Delhivery">Delhivery</option>
                    <option value="Professional Couriers">The Professional Couriers</option>
                    <option value="Blue Dart">Blue Dart</option>
                    <option value="Other">Other Courier / Local Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#66766D] block mb-1">
                    Consignment / AWB Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingForm.trackingNumber}
                    onChange={(e) => {
                      const num = e.target.value;
                      setTrackingForm((prev) => ({ ...prev, trackingNumber: num }));
                    }}
                    placeholder="e.g. D12345678 or STC987654"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E3E9E5] bg-[#FAF8F5] font-mono text-[#14261D] focus:outline-none focus:border-[#0F6B47]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#66766D] block mb-1">
                    Live Tracking URL
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="url"
                      value={trackingForm.trackingUrl}
                      onChange={(e) => setTrackingForm((prev) => ({ ...prev, trackingUrl: e.target.value }))}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E3E9E5] bg-[#FAF8F5] text-[#14261D] focus:outline-none focus:border-[#0F6B47]"
                    />
                    {trackingForm.trackingUrl && (
                      <a
                        href={trackingForm.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#0F6B47] transition shrink-0"
                        title="Test tracking link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#66766D] block mb-1">
                    Estimated Delivery
                  </label>
                  <input
                    type="text"
                    value={trackingForm.estimatedDelivery}
                    onChange={(e) => setTrackingForm((prev) => ({ ...prev, estimatedDelivery: e.target.value }))}
                    placeholder="e.g. 2–3 Business Days / 14 Nov"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E3E9E5] bg-[#FAF8F5] text-[#14261D] focus:outline-none focus:border-[#0F6B47]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveTracking}
                  disabled={isSavingTracking}
                  className="px-4 py-1.5 rounded-xl bg-[#0F6B47] hover:bg-[#0D5B3C] text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  {isSavingTracking ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save Tracking Info</span>
                </button>
              </div>
            </div>

            {/* Items Ordered Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#66766D] flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#0F6B47]" />
                <span>Items Ordered</span>
              </h3>
              <div className="rounded-2xl border border-[#E3E9E5] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7FAF8] text-[#66766D] border-b border-[#E3E9E5]">
                    <tr>
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3E9E5]">
                    {selectedOrder.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-semibold text-[#14261D]">{it.productName}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-[#14261D]">×{it.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono">₹{it.unitPrice}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0F6B47]">
                          ₹{it.totalPrice}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#F7FAF8] border-t border-[#E3E9E5] text-xs">
                    <tr>
                      <td colSpan={3} className="py-2 px-3 text-right font-medium text-[#66766D]">
                        Subtotal:
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        ₹{selectedOrder.subtotal}.00
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="py-1 px-3 text-right font-medium text-[#66766D]">
                        Delivery:
                      </td>
                      <td className="py-1 px-3 text-right font-mono font-bold text-emerald-700">
                        {selectedOrder.deliveryCharge === 0 ? 'FREE' : `₹${selectedOrder.deliveryCharge}.00`}
                      </td>
                    </tr>
                    <tr className="border-t border-[#E3E9E5]">
                      <td colSpan={3} className="py-2.5 px-3 text-right font-bold text-sm text-[#14261D]">
                        Grand Total:
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-base text-[#0B4A33]">
                        ₹{selectedOrder.totalAmount}.00
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Internal Admin Notes */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#66766D]">
                Internal Admin Notes
              </h3>
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="Add private notes for staff (e.g. called customer, preferred delivery time)…"
                  className="w-full p-3 rounded-xl border border-[#E3E9E5] text-xs focus:outline-none focus:border-[#0F6B47]"
                />
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="px-4 py-1.5 rounded-lg bg-[#0F6B47] text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSavingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Notes</span>
                </button>
              </div>
            </div>

            {/* Status History Timeline */}
            <div className="space-y-3 pt-2 border-t border-[#E3E9E5]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#66766D] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#0F6B47]" />
                <span>Status History & Audit Trail</span>
              </h3>
              
              <div className="space-y-2">
                {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 ? (
                  selectedOrder.statusHistory.map((hist, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#F7FAF8] border border-[#E3E9E5] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                            STATUS_CONFIG[hist.status]?.badgeClass
                          }`}
                        >
                          {STATUS_CONFIG[hist.status]?.label}
                        </span>
                        <span className="text-[#66766D]">
                          by <b className="text-[#14261D]">{hist.changedBy}</b>
                          {hist.note ? ` — "${hist.note}"` : ''}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-[#66766D]">
                        {formatOrderDateTime(hist.changedAt)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#66766D]">No history recorded yet.</p>
                )}
              </div>
            </div>

            {/* Cancel Order Action */}
            {selectedOrder.orderStatus !== 'cancelled' && (
              <div className="pt-2 border-t border-[#E3E9E5] flex justify-between items-center">
                <span className="text-xs text-[#66766D]">Need to cancel this order?</span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Are you sure you want to cancel Order #${selectedOrder.orderNumber}?`)) {
                      handleStatusChange(selectedOrder.id || selectedOrder.orderNumber, 'cancelled');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition"
                >
                  Cancel Order
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
