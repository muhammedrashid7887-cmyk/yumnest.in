'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import {
  fetchApprovedDistributors,
  updateDistributorApplication,
} from '@/lib/api/business';
import type {
  DistributorApplication,
  DistributorStatus,
} from '@/types/api';
import {
  Award,
  Search,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
  X,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Power,
  ArrowLeft,
  Store,
  Layers,
} from 'lucide-react';

export default function ApprovedDistributorManager() {
  const [distributors, setDistributors] = useState<DistributorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'deactivated'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected distributor for modal
  const [selectedDist, setSelectedDist] = useState<DistributorApplication | null>(null);
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
      const res = await fetchApprovedDistributors({
        page,
        limit: 50,
        status: filterStatus,
        search: searchQuery || undefined,
      });
      setDistributors(res.data || []);
      setTotalCount(res.meta?.total ?? res.data?.length ?? 0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load approved distributors';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle active / deactivated
  const handleToggleActive = (dist: DistributorApplication) => {
    const isCurrentlyActive = dist.status === 'approved';
    const newStatus: DistributorStatus = isCurrentlyActive ? 'deactivated' : 'approved';
    const actionLabel = isCurrentlyActive ? 'deactivate' : 'reactivate';

    if (!window.confirm(`Are you sure you want to ${actionLabel} ${dist.businessName}?`)) {
      return;
    }

    startActionTransition(async () => {
      try {
        const updated = await updateDistributorApplication(dist.applicationId, {
          status: newStatus,
        });
        setDistributors((prev) =>
          prev.map((d) => (d.applicationId === updated.applicationId ? updated : d))
        );
        if (selectedDist?.applicationId === updated.applicationId) {
          setSelectedDist(updated);
        }
        showToast(
          isCurrentlyActive
            ? `${dist.businessName} has been deactivated`
            : `${dist.businessName} has been reactivated`
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update status';
        showToast(message);
      }
    });
  };

  // Prefilled WhatsApp generator for Admin
  const getWhatsAppContactUrl = (dist: DistributorApplication) => {
    const rawNumber = dist.whatsapp || dist.mobile;
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

    const message = `Hello ${dist.fullName}, greetings from Yum Nest Spices & Foods! 🌿
Authorized Distribution Partner: ${dist.businessName} (${dist.city}, ${dist.district})
Application ID: ${dist.applicationId}

Checking in regarding product replenishment, new batch arrivals, and local distributor support. How can we support your market operations this week?`;

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
          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/distributors"
              className="p-1.5 -ml-1 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-white transition"
              title="Back to applications"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-extrabold text-[#14261D] tracking-tight font-serif">
              Approved Distributors Network
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0F6B47] text-xs font-bold">
              {totalCount} Partners
            </span>
          </div>
          <p className="text-xs text-[#66766D] mt-1 pl-8 sm:pl-0">
            Active and registered authorized regional distribution partners representing Yum Nest across territories.
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

      {/* ── Search & Filter ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E3E9E5] p-3 sm:p-4 shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search approved partners by name, agency, city, phone..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F8FAF9] border border-[#E3E9E5] text-xs text-[#14261D] focus:outline-none focus:ring-2 focus:ring-[#0F6B47]/20 focus:border-[#0F6B47]"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-[#0F6B47] text-white shadow-2xs'
                : 'text-[#66766D] hover:bg-stone-100'
            }`}
          >
            All Partners
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'approved'
                ? 'bg-[#0F6B47] text-white shadow-2xs'
                : 'text-[#66766D] hover:bg-stone-100'
            }`}
          >
            Active Only
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('deactivated')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'deactivated'
                ? 'bg-[#0F6B47] text-white shadow-2xs'
                : 'text-[#66766D] hover:bg-stone-100'
            }`}
          >
            Deactivated
          </button>
        </div>
      </div>

      {/* ── Table Container ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E3E9E5] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#0F6B47] mx-auto" />
            <p className="text-xs text-[#66766D] mt-2 font-medium">Loading distributor network...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-600 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto" />
            <p className="text-xs font-semibold">{error}</p>
          </div>
        ) : distributors.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Award className="w-12 h-12 text-stone-300 mx-auto stroke-1" />
            <p className="text-sm font-bold text-stone-700">No approved distributors found</p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              When an applicant is approved in the &quot;Distributor Applications&quot; section, they will automatically appear here as authorized partners.
            </p>
            <Link
              href="/admin/distributors"
              className="inline-block mt-2 px-4 py-2 rounded-xl bg-[#0F6B47] text-white font-bold text-xs shadow-sm hover:shadow"
            >
              Go to Applications
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAF9] border-b border-[#E3E9E5] text-[10px] uppercase font-bold text-[#66766D] tracking-wider">
                  <th className="py-3 px-4">Partner Agency</th>
                  <th className="py-3 px-4">Distributor Name</th>
                  <th className="py-3 px-4">Contact Number</th>
                  <th className="py-3 px-4">Territory</th>
                  <th className="py-3 px-4">Authorized Categories</th>
                  <th className="py-3 px-4">Approved Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E9E5]">
                {distributors.map((dist) => {
                  const isActive = dist.status === 'approved';
                  const approvedDate = dist.approvedAt
                    ? new Date(dist.approvedAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : new Date(dist.updatedAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      });

                  return (
                    <tr key={dist.applicationId} className="hover:bg-stone-50/70 transition">
                      {/* Agency */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#14261D]">{dist.businessName}</div>
                        <span className="font-mono text-[10px] text-[#0F6B47] block">
                          {dist.applicationId}
                        </span>
                      </td>

                      {/* Distributor Name */}
                      <td className="py-3 px-4 font-semibold text-stone-800">
                        {dist.fullName}
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4 font-mono text-stone-900">
                        {dist.mobile}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 text-stone-700">
                        <span className="font-semibold">{dist.city}</span>, {dist.district}
                      </td>

                      {/* Categories */}
                      <td className="py-3 px-4 max-w-[190px]">
                        <div className="text-[11px] text-stone-800 line-clamp-1">
                          {dist.interestedCategories.join(', ')}
                        </div>
                      </td>

                      {/* Approved Date */}
                      <td className="py-3 px-4 text-stone-500 whitespace-nowrap">
                        {approvedDate}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            isActive
                              ? 'bg-[#D8F0E0] text-[#17673A]'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {isActive ? 'Active Partner' : 'Deactivated'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* WhatsApp Direct */}
                          <a
                            href={getWhatsAppContactUrl(dist)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 text-[#17673A] hover:bg-emerald-100 transition shadow-2xs"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          {/* Toggle Active / Deactivate */}
                          <button
                            type="button"
                            onClick={() => handleToggleActive(dist)}
                            disabled={actionPending}
                            className={`p-1.5 rounded-lg transition shadow-2xs cursor-pointer ${
                              isActive
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'bg-emerald-50 text-[#17673A] hover:bg-emerald-100'
                            }`}
                            title={isActive ? 'Deactivate distributor' : 'Reactivate distributor'}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          {/* Details */}
                          <button
                            type="button"
                            onClick={() => setSelectedDist(dist)}
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
      </div>

      {/* ── Distributor Details Modal ─────────────────────────────────────── */}
      {selectedDist && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#081811]/60 backdrop-blur-xs"
          onClick={() => setSelectedDist(null)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E3E9E5] overflow-hidden flex flex-col max-h-[90vh] text-[#14261D] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#F8FAF9] border-b border-[#E3E9E5] flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-extrabold text-[#0F6B47]">
                  {selectedDist.applicationId}
                </span>
                <h3 className="text-lg font-extrabold text-stone-900 font-serif">
                  {selectedDist.businessName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDist(null)}
                className="p-1.5 rounded-full hover:bg-stone-200/80 text-stone-500 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#F8FAF9] border border-[#E3E9E5]">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#66766D] block">Authorized Partner</span>
                  <span className="font-bold text-sm text-stone-900">{selectedDist.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#66766D] block">Distribution Model</span>
                  <span className="font-bold text-sm text-stone-900">{selectedDist.businessType}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#66766D] block">Contact Phone</span>
                  <span className="font-mono font-bold text-sm text-stone-900">{selectedDist.mobile}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#66766D] block">Territory</span>
                  <span className="font-semibold text-stone-900">
                    {selectedDist.city}, {selectedDist.district}, {selectedDist.state}
                  </span>
                </div>
              </div>

              {/* Physical Address */}
              <div className="p-4 rounded-2xl bg-white border border-[#E3E9E5] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#66766D] block">Registered Business Address</span>
                <p className="text-stone-800 font-medium leading-relaxed">{selectedDist.address}</p>
              </div>

              {/* Categories */}
              <div className="p-4 rounded-2xl bg-white border border-[#E3E9E5] space-y-2">
                <span className="text-[10px] font-bold uppercase text-[#66766D] block">Authorized Product Categories</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDist.interestedCategories.map((cat) => (
                    <span
                      key={cat}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#0F6B47] font-semibold border border-emerald-200"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {selectedDist.adminNotes && (
                <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E3E9E5] space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#66766D] block">Admin Notes</span>
                  <p className="text-stone-800 leading-relaxed italic">{selectedDist.adminNotes}</p>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 bg-[#F8FAF9] border-t border-[#E3E9E5] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleToggleActive(selectedDist)}
                disabled={actionPending}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  selectedDist.status === 'approved'
                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{selectedDist.status === 'approved' ? 'Deactivate Partner' : 'Reactivate Partner'}</span>
              </button>

              <a
                href={getWhatsAppContactUrl(selectedDist)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Message Partner on WhatsApp</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
