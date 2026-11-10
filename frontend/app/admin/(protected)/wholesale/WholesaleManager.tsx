'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import {
  fetchWholesaleEnquiries,
  fetchWholesaleStats,
  updateWholesaleEnquiry,
  deleteWholesaleEnquiry,
} from '@/lib/api/business';
import type {
  WholesaleEnquiry,
  WholesaleEnquiryStatus,
  WholesaleStats,
} from '@/types/api';
import {
  Building2,
  Search,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
  X,
  ExternalLink,
  MessageCircle,
  Trash2,
  RefreshCw,
  FileText,
  Package,
} from 'lucide-react';

const STATUS_CONFIG: Record<
  WholesaleEnquiryStatus,
  { label: string; badgeClass: string; bgTile: string; textColor: string }
> = {
  pending: {
    label: 'Pending',
    badgeClass: 'bg-[#FDF0D4] text-[#8F5F08]',
    bgTile: 'bg-[#FEF6E6]',
    textColor: 'text-[#8F5F08]',
  },
  contacted: {
    label: 'Contacted',
    badgeClass: 'bg-[#DCE9FB] text-[#1D57A3]',
    bgTile: 'bg-[#EDF4FD]',
    textColor: 'text-[#1D57A3]',
  },
  quotation_sent: {
    label: 'Quotation Sent',
    badgeClass: 'bg-[#E7E0FA] text-[#593EAE]',
    bgTile: 'bg-[#F3EFFC]',
    textColor: 'text-[#593EAE]',
  },
  negotiation: {
    label: 'Negotiation',
    badgeClass: 'bg-[#FEF3C7] text-[#92400E]',
    bgTile: 'bg-[#FFFBEB]',
    textColor: 'text-[#92400E]',
  },
  converted: {
    label: 'Converted',
    badgeClass: 'bg-[#D8F0E0] text-[#17673A]',
    bgTile: 'bg-[#EAF7EF]',
    textColor: 'text-[#17673A]',
  },
  rejected: {
    label: 'Rejected',
    badgeClass: 'bg-[#FBE1E1] text-[#A02A2A]',
    bgTile: 'bg-[#FDF0F0]',
    textColor: 'text-[#A02A2A]',
  },
};

const ALL_STATUSES: WholesaleEnquiryStatus[] = [
  'pending',
  'contacted',
  'quotation_sent',
  'negotiation',
  'converted',
  'rejected',
];

export default function WholesaleManager() {
  const [enquiries, setEnquiries] = useState<WholesaleEnquiry[]>([]);
  const [stats, setStats] = useState<WholesaleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Active Enquiry for Detail / Action modal
  const [selectedEnquiry, setSelectedEnquiry] = useState<WholesaleEnquiry | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [statusUpdateInput, setStatusUpdateInput] = useState<WholesaleEnquiryStatus>('pending');
  const [actionPending, startActionTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [enqRes, statsRes] = await Promise.all([
        fetchWholesaleEnquiries({
          page,
          limit: 20,
          status: activeStatus,
          search: searchQuery || undefined,
        }),
        fetchWholesaleStats(),
      ]);

      setEnquiries(enqRes.data || []);
      if (enqRes.meta) {
        setTotalPages(enqRes.meta.pages || 1);
        setTotalCount(enqRes.meta.total || 0);
      } else {
        setTotalCount(enqRes.data?.length || 0);
      }
      setStats(statsRes);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load wholesale enquiries';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, activeStatus, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Details Modal
  const openDetails = (enquiry: WholesaleEnquiry) => {
    setSelectedEnquiry(enquiry);
    setAdminNotesInput(enquiry.adminNotes || '');
    setStatusUpdateInput(enquiry.status);
  };

  // Close Details Modal
  const closeDetails = () => {
    setSelectedEnquiry(null);
  };

  // Update Status & Notes
  const handleSaveDetails = () => {
    if (!selectedEnquiry) return;
    startActionTransition(async () => {
      try {
        const updated = await updateWholesaleEnquiry(selectedEnquiry.enquiryId, {
          status: statusUpdateInput,
          adminNotes: adminNotesInput,
        });
        setSelectedEnquiry(updated);
        setEnquiries((prev) =>
          prev.map((e) => (e.enquiryId === updated.enquiryId ? updated : e))
        );
        showToast(`Enquiry ${updated.enquiryId} updated successfully`);
        // Refresh stats
        fetchWholesaleStats().then(setStats).catch(() => {});
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update enquiry';
        showToast(message);
      }
    });
  };

  // Delete Enquiry
  const handleDelete = (enquiryId: string) => {
    if (!window.confirm(`Are you sure you want to delete enquiry #${enquiryId}? This cannot be undone.`)) {
      return;
    }
    startActionTransition(async () => {
      try {
        await deleteWholesaleEnquiry(enquiryId);
        showToast(`Enquiry #${enquiryId} deleted`);
        closeDetails();
        loadData();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to delete enquiry';
        showToast(message);
      }
    });
  };

  // Prefilled WhatsApp generator for Admin to contact client
  const getWhatsAppContactUrl = (enquiry: WholesaleEnquiry) => {
    const rawNumber = enquiry.whatsapp || enquiry.mobile;
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

    const message = `Hello ${enquiry.fullName}, greetings from Yum Nest Spices & Foods! 🌿
Regarding your wholesale enquiry #${enquiry.enquiryId} for ${enquiry.businessName}:
Interested Products: ${enquiry.interestedProducts.join(', ')}
Required Quantity: ${enquiry.requiredQuantity}

We are pleased to assist you with wholesale pricing, bulk packaging, and delivery terms. How may we assist you today?`;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#14261D] tracking-tight font-serif">
              Wholesale Enquiries
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E3F2EA] text-[#0F6B47] text-xs font-bold">
              {totalCount} Total
            </span>
          </div>
          <p className="text-xs text-[#66766D] mt-1">
            Manage bulk orders, store purchase requests, wholesale pricing, and direct WhatsApp quotations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E3E9E5] hover:border-[#0F6B47] text-xs font-semibold text-[#14261D] shadow-2xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0F6B47]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Stats Tiles ───────────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-[#E3E9E5] shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-[#66766D] block">All Enquiries</span>
            <span className="text-xl font-extrabold text-[#14261D] mt-1 block">{stats.total}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FEF6E6] border border-[#F3DFC1] shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-[#8F5F08] block">Pending</span>
            <span className="text-xl font-extrabold text-[#8F5F08] mt-1 block">{stats.pending}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#EDF4FD] border border-[#CDE1F9] shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-[#1D57A3] block">Contacted</span>
            <span className="text-xl font-extrabold text-[#1D57A3] mt-1 block">{stats.contacted}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F3EFFC] border border-[#DDD4F7] shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-[#593EAE] block">Quotation Sent</span>
            <span className="text-xl font-extrabold text-[#593EAE] mt-1 block">{stats.quotation_sent}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-[#FEE8A2] shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-[#92400E] block">Negotiation</span>
            <span className="text-xl font-extrabold text-[#92400E] mt-1 block">{stats.negotiation}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#EAF7EF] border border-[#C5EBDA] shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-[#17673A] block">Converted</span>
            <span className="text-xl font-extrabold text-[#17673A] mt-1 block">{stats.converted}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FDF0F0] border border-[#F9CFCF] shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-[#A02A2A] block">Rejected</span>
            <span className="text-xl font-extrabold text-[#A02A2A] mt-1 block">{stats.rejected}</span>
          </div>
        </div>
      )}

      {/* ── Filters & Search ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E3E9E5] p-3 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by ID, name, shop, phone, district..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F8FAF9] border border-[#E3E9E5] text-xs text-[#14261D] focus:outline-none focus:ring-2 focus:ring-[#0F6B47]/20 focus:border-[#0F6B47]"
            />
          </div>

          {/* Quick status tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
            <button
              type="button"
              onClick={() => {
                setActiveStatus('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeStatus === 'all'
                  ? 'bg-[#0F6B47] text-white shadow-2xs'
                  : 'text-[#66766D] hover:bg-stone-100'
              }`}
            >
              All
            </button>
            {ALL_STATUSES.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setActiveStatus(st);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeStatus === st
                    ? 'bg-[#0F6B47] text-white shadow-2xs'
                    : 'text-[#66766D] hover:bg-stone-100'
                }`}
              >
                {STATUS_CONFIG[st].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table Container ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E3E9E5] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#0F6B47] mx-auto" />
            <p className="text-xs text-[#66766D] mt-2 font-medium">Loading wholesale enquiries...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-600 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto" />
            <p className="text-xs font-semibold">{error}</p>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Building2 className="w-12 h-12 text-stone-300 mx-auto stroke-1" />
            <p className="text-sm font-bold text-stone-700">No wholesale enquiries found</p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              New submissions from customers via the &quot;Wholesale &amp; Distribution&quot; website popup will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAF9] border-b border-[#E3E9E5] text-[10px] uppercase font-bold text-[#66766D] tracking-wider">
                  <th className="py-3 px-4">Enquiry ID</th>
                  <th className="py-3 px-4">Customer &amp; Business</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Products</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E9E5]">
                {enquiries.map((enq) => {
                  const statusConf = STATUS_CONFIG[enq.status] || STATUS_CONFIG.pending;
                  const formattedDate = new Date(enq.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={enq.enquiryId} className="hover:bg-stone-50/70 transition">
                      {/* Enquiry ID */}
                      <td className="py-3 px-4 font-mono font-bold text-[#0F6B47]">
                        {enq.enquiryId}
                      </td>

                      {/* Customer & Business */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#14261D]">{enq.fullName}</div>
                        <div className="text-[11px] text-[#66766D] truncate max-w-[160px]">
                          {enq.businessName} &bull; <span className="font-medium">{enq.businessType}</span>
                        </div>
                      </td>

                      {/* Mobile */}
                      <td className="py-3 px-4 font-mono text-[#14261D]">
                        {enq.mobile}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 text-stone-700">
                        <span className="font-semibold">{enq.district}</span>, {enq.state}
                      </td>

                      {/* Products */}
                      <td className="py-3 px-4 max-w-[180px]">
                        <div className="text-[11px] text-stone-800 line-clamp-1">
                          {enq.interestedProducts.join(', ')}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {enq.interestedProducts.length} product(s) selected
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-4 font-semibold text-stone-800">
                        {enq.requiredQuantity}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full font-bold text-[10px] ${statusConf.badgeClass}`}>
                          {statusConf.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-stone-500 whitespace-nowrap">
                        {formattedDate}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* WhatsApp Direct */}
                          <a
                            href={getWhatsAppContactUrl(enq)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 text-[#17673A] hover:bg-emerald-100 transition shadow-2xs"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          {/* View Details */}
                          <button
                            type="button"
                            onClick={() => openDetails(enq)}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E3E9E5] text-[#14261D] hover:text-[#0F6B47] hover:border-[#0F6B47] font-semibold text-xs shadow-2xs transition cursor-pointer"
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
          <div className="p-4 border-t border-[#E3E9E5] flex items-center justify-between text-xs text-[#66766D]">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-[#E3E9E5] bg-white disabled:opacity-40 hover:bg-stone-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-[#E3E9E5] bg-white disabled:opacity-40 hover:bg-stone-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── View & Edit Details Modal ─────────────────────────────────────── */}
      {selectedEnquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#081811]/60 backdrop-blur-xs"
          onClick={closeDetails}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E3E9E5] overflow-hidden flex flex-col max-h-[90vh] text-[#14261D] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#F8FAF9] border-b border-[#E3E9E5] flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-extrabold text-[#0F6B47]">
                  {selectedEnquiry.enquiryId}
                </span>
                <h3 className="text-lg font-extrabold text-stone-900 font-serif">
                  {selectedEnquiry.businessName}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeDetails}
                className="p-1.5 rounded-full hover:bg-stone-200/80 text-stone-500 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">

              {/* Contact Info Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#F8FAF9] border border-[#E3E9E5]">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#66766D] block">Contact Person</span>
                  <span className="font-bold text-sm text-stone-900">{selectedEnquiry.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#66766D] block">Business Type</span>
                  <span className="font-bold text-sm text-stone-900">{selectedEnquiry.businessType}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#66766D] block">Primary Mobile</span>
                  <span className="font-mono font-bold text-sm text-stone-900">{selectedEnquiry.mobile}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#66766D] block">WhatsApp</span>
                  <span className="font-mono font-bold text-sm text-stone-900">
                    {selectedEnquiry.whatsapp || 'Same as mobile'}
                  </span>
                </div>
                {selectedEnquiry.email && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#66766D] block">Email</span>
                    <span className="font-medium text-stone-900">{selectedEnquiry.email}</span>
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#66766D] block">Location</span>
                  <span className="font-semibold text-stone-900">
                    {selectedEnquiry.district}, {selectedEnquiry.state}
                  </span>
                </div>
              </div>

              {/* Requirement Details */}
              <div className="p-4 rounded-2xl bg-white border border-[#E3E9E5] space-y-3">
                <div className="flex items-center gap-2 text-stone-800 font-bold">
                  <Package className="w-4 h-4 text-[#0F6B47]" />
                  <span>Requirement Details</span>
                </div>
                <div className="space-y-1">
                  <span className="text-stone-500 block">Interested Products:</span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {selectedEnquiry.interestedProducts.map((p) => (
                      <span
                        key={p}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#0F6B47] font-semibold border border-emerald-200"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-stone-500">Required Quantity: </span>
                  <span className="font-extrabold text-stone-900">{selectedEnquiry.requiredQuantity}</span>
                </div>
                {selectedEnquiry.message && (
                  <div className="pt-2 border-t border-stone-100">
                    <span className="text-stone-500 block mb-1">Customer Message:</span>
                    <p className="p-3 rounded-xl bg-stone-50 text-stone-800 italic">
                      &quot;{selectedEnquiry.message}&quot;
                    </p>
                  </div>
                )}
              </div>

              {/* Status Update & Admin Notes */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E3E9E5] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-800">Enquiry Status</label>
                  <select
                    value={statusUpdateInput}
                    onChange={(e) => setStatusUpdateInput(e.target.value as WholesaleEnquiryStatus)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#E3E9E5] font-bold text-xs text-[#14261D]"
                  >
                    {ALL_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {STATUS_CONFIG[st].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">Admin Internal Notes</label>
                  <textarea
                    rows={3}
                    value={adminNotesInput}
                    onChange={(e) => setAdminNotesInput(e.target.value)}
                    placeholder="Add notes e.g. 'Sent wholesale price sheet via WhatsApp on 10 Nov'..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E3E9E5] text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0F6B47]/20 resize-none"
                  />
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 bg-[#F8FAF9] border-t border-[#E3E9E5] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDelete(selectedEnquiry.enquiryId)}
                disabled={actionPending}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={getWhatsAppContactUrl(selectedEnquiry)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={handleSaveDetails}
                  disabled={actionPending}
                  className="px-5 py-2 rounded-xl bg-[#0F6B47] hover:bg-[#17694B] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {actionPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
