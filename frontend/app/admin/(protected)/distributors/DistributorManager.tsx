'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import {
  fetchDistributorApplications,
  fetchDistributorStats,
  updateDistributorApplication,
  deleteDistributorApplication,
} from '@/lib/api/business';
import type {
  DistributorApplication,
  DistributorStatus,
  DistributorStats,
} from '@/types/api';
import { useAdminSocket, useSocketEvent } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/lib/socket/events';
import {
  TrendingUp,
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
  Trash2,
  RefreshCw,
  Award,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { AdminTableRowSkeleton } from '@/components/ui/Skeleton';

const STATUS_CONFIG: Record<
  DistributorStatus,
  { label: string; badgeClass: string; bgTile: string; textColor: string }
> = {
  pending: {
    label: 'Pending',
    badgeClass: 'bg-[#FDF0D4] text-[#8F5F08]',
    bgTile: 'bg-[#FEF6E6]',
    textColor: 'text-[#8F5F08]',
  },
  under_review: {
    label: 'Under Review',
    badgeClass: 'bg-[#E7E0FA] text-[#593EAE]',
    bgTile: 'bg-[#F3EFFC]',
    textColor: 'text-[#593EAE]',
  },
  contacted: {
    label: 'Contacted',
    badgeClass: 'bg-[#DCE9FB] text-[#1D57A3]',
    bgTile: 'bg-[#EDF4FD]',
    textColor: 'text-[#1D57A3]',
  },
  approved: {
    label: 'Approved',
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
  deactivated: {
    label: 'Deactivated',
    badgeClass: 'bg-stone-200 text-stone-700',
    bgTile: 'bg-stone-100',
    textColor: 'text-stone-700',
  },
};

const MAIN_STATUSES: DistributorStatus[] = [
  'pending',
  'under_review',
  'contacted',
  'approved',
  'rejected',
];

export default function DistributorManager() {
  const [applications, setApplications] = useState<DistributorApplication[]>([]);
  const [stats, setStats] = useState<DistributorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Active Application for Detail / Action modal
  const [selectedApp, setSelectedApp] = useState<DistributorApplication | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [statusUpdateInput, setStatusUpdateInput] = useState<DistributorStatus>('pending');
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
      const [appRes, statsRes] = await Promise.all([
        fetchDistributorApplications({
          page,
          limit: 20,
          status: activeStatus,
          search: searchQuery || undefined,
        }),
        fetchDistributorStats(),
      ]);

      setApplications(appRes.data || []);
      if (appRes.meta) {
        setTotalPages(appRes.meta.pages || 1);
        setTotalCount(appRes.meta.total || 0);
      } else {
        setTotalCount(appRes.data?.length || 0);
      }
      setStats(statsRes);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load distributor applications';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, activeStatus, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Join admin room for real-time distributor alerts
  useAdminSocket();

  // Socket.IO: Prepend newly submitted distributor applications live
  useSocketEvent(SOCKET_EVENTS.ENQUIRY_CREATED, (data: { application?: DistributorApplication; kind?: string }) => {
    if (data?.kind !== 'distributor' || !data?.application) return;
    const newApp = data.application;
    setApplications((prev) => {
      if (prev.some((a) => a.applicationId === newApp.applicationId)) return prev;
      return [newApp, ...prev];
    });
    setTotalCount((prev) => prev + 1);
    fetchDistributorStats().then(setStats).catch(() => {});
    showToast(`New distributor application from ${newApp.fullName} (${newApp.businessName || newApp.city})!`);
  });

  // Socket.IO: Update distributor application in-place when status changes
  useSocketEvent(SOCKET_EVENTS.ENQUIRY_STATUS_UPDATED, (data: { application?: DistributorApplication; kind?: string }) => {
    if (data?.kind !== 'distributor' || !data?.application) return;
    const updated = data.application;
    setApplications((prev) => prev.map((a) => (a.applicationId === updated.applicationId ? updated : a)));
    setSelectedApp((cur) => (cur && cur.applicationId === updated.applicationId ? updated : cur));
    fetchDistributorStats().then(setStats).catch(() => {});
  });

  // Open Details Modal
  const openDetails = (app: DistributorApplication) => {
    setSelectedApp(app);
    setAdminNotesInput(app.adminNotes || '');
    setStatusUpdateInput(app.status);
  };

  // Close Details Modal
  const closeDetails = () => {
    setSelectedApp(null);
  };

  // Quick Status change
  const handleQuickStatusChange = (newStatus: DistributorStatus) => {
    if (!selectedApp) return;
    startActionTransition(async () => {
      try {
        const updated = await updateDistributorApplication(selectedApp.applicationId, {
          status: newStatus,
          adminNotes: adminNotesInput,
        });
        setSelectedApp(updated);
        setStatusUpdateInput(newStatus);
        setApplications((prev) =>
          prev.map((a) => (a.applicationId === updated.applicationId ? updated : a))
        );
        showToast(`Application #${updated.applicationId} marked as ${STATUS_CONFIG[newStatus].label}`);
        fetchDistributorStats().then(setStats).catch(() => {});
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update application';
        showToast(message);
      }
    });
  };

  // Save changes from modal
  const handleSaveDetails = () => {
    if (!selectedApp) return;
    startActionTransition(async () => {
      try {
        const updated = await updateDistributorApplication(selectedApp.applicationId, {
          status: statusUpdateInput,
          adminNotes: adminNotesInput,
        });
        setSelectedApp(updated);
        setApplications((prev) =>
          prev.map((a) => (a.applicationId === updated.applicationId ? updated : a))
        );
        showToast(`Application #${updated.applicationId} updated successfully`);
        fetchDistributorStats().then(setStats).catch(() => {});
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update application';
        showToast(message);
      }
    });
  };

  // Delete Application
  const handleDelete = (applicationId: string) => {
    if (!window.confirm(`Are you sure you want to delete application #${applicationId}? This cannot be undone.`)) {
      return;
    }
    startActionTransition(async () => {
      try {
        await deleteDistributorApplication(applicationId);
        showToast(`Application #${applicationId} deleted`);
        closeDetails();
        loadData();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to delete application';
        showToast(message);
      }
    });
  };

  // Prefilled WhatsApp generator for Admin to contact client
  const getWhatsAppContactUrl = (app: DistributorApplication) => {
    const rawNumber = app.whatsapp || app.mobile;
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

    const message = `Hello ${app.fullName}, greetings from Yum Nest Spices & Foods!
Regarding your Distributor Partnership Application #${app.applicationId} for ${app.businessName} (${app.city}, ${app.district}):
We are reviewing your profile for regional distribution rights in your territory. Could we schedule a brief discussion regarding distribution terms and supply requirements?`;

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
              Distributor Applications
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E3F2EA] text-[#0F6B47] text-xs font-bold">
              {totalCount} Total
            </span>
          </div>
          <p className="text-xs text-[#66766D] mt-1">
            Review territory partner applications, distribution experience, approve new distributors, and connect via WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/distributors/approved"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold text-[#0F6B47] shadow-2xs transition"
          >
            <Award className="w-3.5 h-3.5" />
            <span>View Approved Network ({stats?.approved || 0})</span>
          </Link>

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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-[#E3E9E5] shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-[#66766D] block">All Applications</span>
            <span className="text-xl font-extrabold text-[#14261D] mt-1 block">{stats.total}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FEF6E6] border border-[#F3DFC1] shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-[#8F5F08] block">Pending</span>
            <span className="text-xl font-extrabold text-[#8F5F08] mt-1 block">{stats.pending}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F3EFFC] border border-[#DDD4F7] shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-[#593EAE] block">Under Review</span>
            <span className="text-xl font-extrabold text-[#593EAE] mt-1 block">{stats.under_review}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#EDF4FD] border border-[#CDE1F9] shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-[#1D57A3] block">Contacted</span>
            <span className="text-xl font-extrabold text-[#1D57A3] mt-1 block">{stats.contacted}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#EAF7EF] border border-[#C5EBDA] shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-[#17673A] block">Approved</span>
            <span className="text-xl font-extrabold text-[#17673A] mt-1 block">{stats.approved}</span>
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
              placeholder="Search by ID, name, agency, district, city..."
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
            {MAIN_STATUSES.map((st) => (
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAF9] border-b border-[#E3E9E5] text-[10px] uppercase font-bold text-[#66766D] tracking-wider">
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Applicant &amp; Agency</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Territory</th>
                  <th className="py-3 px-4">Business Type</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <AdminTableRowSkeleton key={i} columns={9} />
                ))}
              </tbody>
            </table>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-600 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto" />
            <p className="text-xs font-semibold">{error}</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <TrendingUp className="w-12 h-12 text-stone-300 mx-auto stroke-1" />
            <p className="text-sm font-bold text-stone-700">No distributor applications found</p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Submissions from agencies applying via &quot;Become a Distributor&quot; will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAF9] border-b border-[#E3E9E5] text-[10px] uppercase font-bold text-[#66766D] tracking-wider">
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Applicant &amp; Agency</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Territory</th>
                  <th className="py-3 px-4">Business Type</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E9E5]">
                {applications.map((app) => {
                  const statusConf = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                  const formattedDate = new Date(app.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={app.applicationId} className="hover:bg-stone-50/70 transition">
                      {/* Application ID */}
                      <td className="py-3 px-4 font-mono font-bold text-[#0F6B47]">
                        {app.applicationId}
                      </td>

                      {/* Applicant & Agency */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#14261D]">{app.fullName}</div>
                        <div className="text-[11px] text-[#66766D] truncate max-w-[170px]">
                          {app.businessName}
                        </div>
                      </td>

                      {/* Mobile */}
                      <td className="py-3 px-4 font-mono text-[#14261D]">
                        {app.mobile}
                      </td>

                      {/* Territory */}
                      <td className="py-3 px-4 text-stone-700">
                        <span className="font-semibold">{app.city}</span>, {app.district}
                      </td>

                      {/* Business Type */}
                      <td className="py-3 px-4 text-stone-700">
                        {app.businessType}
                      </td>

                      {/* Experience */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            app.distributionExperience === 'yes'
                              ? 'bg-emerald-100 text-[#17673A]'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {app.distributionExperience === 'yes' ? 'Experienced' : 'No'}
                        </span>
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
                            href={getWhatsAppContactUrl(app)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 text-[#17673A] hover:bg-emerald-100 transition shadow-2xs"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          {/* View Full Application */}
                          <button
                            type="button"
                            onClick={() => openDetails(app)}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E3E9E5] text-[#14261D] hover:text-[#0F6B47] hover:border-[#0F6B47] font-semibold text-xs shadow-2xs transition cursor-pointer"
                          >
                            Review
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

      {/* ── Full Application Modal ────────────────────────────────────────── */}
      {selectedApp && (
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
                  {selectedApp.applicationId}
                </span>
                <h3 className="text-lg font-extrabold text-stone-900 font-serif">
                  {selectedApp.businessName}
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

              {/* Applicant Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#F8FAF9] border border-[#E3E9E5]">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#66766D] block">Applicant Name</span>
                  <span className="font-bold text-sm text-stone-900">{selectedApp.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#66766D] block">Business Model</span>
                  <span className="font-bold text-sm text-stone-900">{selectedApp.businessType}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#66766D] block">Primary Phone</span>
                  <span className="font-mono font-bold text-sm text-stone-900">{selectedApp.mobile}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#66766D] block">WhatsApp</span>
                  <span className="font-mono font-bold text-sm text-stone-900">
                    {selectedApp.whatsapp || 'Same as mobile'}
                  </span>
                </div>
                {selectedApp.email && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#66766D] block">Email</span>
                    <span className="font-medium text-stone-900">{selectedApp.email}</span>
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#66766D] block">Territory</span>
                  <span className="font-semibold text-stone-900">
                    {selectedApp.city}, {selectedApp.district}, {selectedApp.state}
                  </span>
                </div>
              </div>

              {/* Address */}
              <div className="p-4 rounded-2xl bg-white border border-[#E3E9E5] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#66766D] block">Full Physical Address</span>
                <p className="text-stone-800 leading-relaxed font-medium">{selectedApp.address}</p>
              </div>

              {/* Experience & Categories */}
              <div className="p-4 rounded-2xl bg-white border border-[#E3E9E5] space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="font-bold text-stone-800">Prior FMCG / Food Distribution Experience:</span>
                  <span
                    className={`px-2.5 py-1 rounded-md font-bold text-xs ${
                      selectedApp.distributionExperience === 'yes'
                        ? 'bg-emerald-100 text-[#17673A]'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {selectedApp.distributionExperience === 'yes' ? 'Yes' : 'No'}
                  </span>
                </div>

                {selectedApp.experienceDetails && (
                  <div>
                    <span className="text-stone-500 block mb-1">Experience Details:</span>
                    <p className="p-3 rounded-xl bg-stone-50 text-stone-800 leading-relaxed">
                      {selectedApp.experienceDetails}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-stone-500 block mb-1">Interested Categories:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedApp.interestedCategories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#0F6B47] font-semibold border border-emerald-200"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedApp.additionalInformation && (
                  <div className="pt-2 border-t border-stone-100">
                    <span className="text-stone-500 block mb-1">Additional Information:</span>
                    <p className="p-3 rounded-xl bg-stone-50 text-stone-800 italic">
                      &quot;{selectedApp.additionalInformation}&quot;
                    </p>
                  </div>
                )}
              </div>

              {/* Status Update & Admin Notes */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E3E9E5] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-800">Application Status</label>
                  <select
                    value={statusUpdateInput}
                    onChange={(e) => setStatusUpdateInput(e.target.value as DistributorStatus)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#E3E9E5] font-bold text-xs text-[#14261D]"
                  >
                    {Object.keys(STATUS_CONFIG).map((st) => (
                      <option key={st} value={st}>
                        {STATUS_CONFIG[st as DistributorStatus].label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Action Decision Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={actionPending || selectedApp.status === 'approved'}
                    onClick={() => handleQuickStatusChange('approved')}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition disabled:opacity-40 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Application</span>
                  </button>

                  <button
                    type="button"
                    disabled={actionPending || selectedApp.status === 'rejected'}
                    onClick={() => handleQuickStatusChange('rejected')}
                    className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition disabled:opacity-40 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject Application</span>
                  </button>
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">Admin Internal Notes</label>
                  <textarea
                    rows={3}
                    value={adminNotesInput}
                    onChange={(e) => setAdminNotesInput(e.target.value)}
                    placeholder="Add notes e.g. 'Verified physical warehouse, agreed to 15-day credit cycle'..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E3E9E5] text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0F6B47]/20 resize-none"
                  />
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 bg-[#F8FAF9] border-t border-[#E3E9E5] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDelete(selectedApp.applicationId)}
                disabled={actionPending}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={getWhatsAppContactUrl(selectedApp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Contact on WhatsApp</span>
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
