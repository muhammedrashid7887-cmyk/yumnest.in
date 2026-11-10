'use client';

/**
 * AdminShell — Master layout shell for the Yumnest admin dashboard.
 * Matches the reference design: Dark green sidebar (#0B4A33), Brand green (#0F6B47), Light background (#F3F6F4).
 */

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tags,
  Images,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Search,
  Bell,
  Building2,
  TrendingUp,
  Award,
} from 'lucide-react';
import { logout } from '@/lib/api/auth';
import { fetchBusinessNotificationStats } from '@/lib/api/business';
import type { AuthenticatedAdmin, BusinessOverviewStats } from '@/types/api';

const NAV_ITEMS = [
  { label: 'Overview',      href: '/admin',            icon: LayoutDashboard },
  { label: 'Orders',        href: '/admin/orders',     icon: ShoppingBag },
  { label: 'Products',      href: '/admin/products',   icon: Package },
  { label: 'Categories',    href: '/admin/categories', icon: Tags },
  { label: 'Media Management', href: '/admin/media',      icon: Images },
] as const;

const BUSINESS_NAV_ITEMS = [
  { label: 'Wholesale Enquiries',      href: '/admin/wholesale',            icon: Building2,  badgeKey: 'wholesale' },
  { label: 'Distributor Applications', href: '/admin/distributors',         icon: TrendingUp, badgeKey: 'distributor' },
  { label: 'Approved Distributors',    href: '/admin/distributors/approved',icon: Award,      badgeKey: null },
] as const;

interface AdminShellProps {
  admin: AuthenticatedAdmin;
  children: React.ReactNode;
}

export default function AdminShell({ admin, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [businessStats, setBusinessStats] = useState<BusinessOverviewStats | null>(null);

  useEffect(() => {
    fetchBusinessNotificationStats()
      .then(setBusinessStats)
      .catch(() => {});
  }, [pathname]);

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await logout();
      } catch {
        // Best-effort logout; will still redirect
      } finally {
        window.location.href = '/admin/login';
      }
    });
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (name.slice(0, 2) || 'AD').toUpperCase();
  };

  const todayStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#F3F6F4] text-[#14261D] flex font-sans antialiased selection:bg-[#0F6B47]/15">

      {/* ── Mobile Backdrop ─────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#081811]/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* ── Fixed Dark Green Sidebar (#0B4A33) ───────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-60 bg-[#0B4A33] text-[#CFE4D9] flex flex-col justify-between
          transform transition-transform duration-200 ease-out border-r border-white/10
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:sticky lg:top-0
        `}
      >
        {/* Sidebar Brand Header */}
        <div>
          <div className="flex items-center justify-between p-4 pb-3 border-b border-white/10">
            <Link
              href="/admin"
              className="flex items-center gap-3 group focus:outline-none"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="relative h-9 w-9 rounded-xl overflow-hidden bg-white/10 border border-white/15 flex items-center justify-center p-1 shadow-sm">
                <Image
                  src="/assets/yummnext-og-logo.png"
                  alt="Yumnest Logo"
                  width={36}
                  height={36}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <div>
                <span className="font-serif font-extrabold text-xl text-[#FFD25E] tracking-tight group-hover:brightness-110 transition block leading-tight">
                  Yum Nest
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#CFE4D9]/80 block">
                  Admin Panel
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#CFE4D9] hover:bg-white/10"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1">
            <div className="px-3 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#CFE4D9]/60">
              Manage Store
            </div>
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all
                    ${isActive
                      ? 'bg-[#17694B] text-white font-semibold shadow-sm'
                      : 'text-[#CFE4D9] hover:text-white hover:bg-[#11583E]'}
                  `}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#CFE4D9]/70'}`} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/60" />}
                </Link>
              );
            })}

            {/* Business Management Section */}
            <div className="px-3 pt-5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#CFE4D9]/60 flex items-center justify-between">
              <span>Business Management</span>
              {businessStats && businessStats.totalPendingBusiness > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 text-[9px] font-black">
                  {businessStats.totalPendingBusiness} new
                </span>
              )}
            </div>
            {BUSINESS_NAV_ITEMS.map(({ label, href, icon: Icon, badgeKey }) => {
              const isActive = pathname === href || pathname.startsWith(href);
              const count =
                badgeKey === 'wholesale'
                  ? businessStats?.pendingWholesaleCount
                  : badgeKey === 'distributor'
                  ? businessStats?.pendingDistributorCount
                  : 0;

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all
                    ${isActive
                      ? 'bg-[#17694B] text-white font-semibold shadow-sm'
                      : 'text-[#CFE4D9] hover:text-white hover:bg-[#11583E]'}
                  `}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#CFE4D9]/70'}`} />
                  <span className="flex-1">{label}</span>
                  {count !== undefined && count > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black text-[10px] shrink-0">
                      {count}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/60 shrink-0" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-3 border-t border-white/10 bg-[#083827]">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-[#D8EFE2] text-[#0B4A33] flex items-center justify-center font-bold text-xs shadow-inner shrink-0">
              {getInitials(admin.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate leading-tight">{admin.name}</p>
              <p className="text-[10px] text-[#CFE4D9]/70 truncate">{admin.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[#CFE4D9] hover:text-white hover:bg-white/10 border border-white/10 transition disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Layout Body ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-[#F3F6F4]/90 backdrop-blur-md border-b border-[#E3E9E5] px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white border border-[#E3E9E5] text-[#14261D] hover:bg-stone-50 transition shadow-2xs"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#66766D]">
              <span>Store is Live</span>
              <span className="w-2 h-2 rounded-full bg-[#1FA971] animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-xs text-[#66766D] font-medium hidden md:inline">
              {todayStr}
            </span>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E3E9E5] text-xs font-semibold text-[#14261D] hover:text-[#0F6B47] hover:border-[#0F6B47] shadow-2xs transition"
              title="Open storefront in new tab"
            >
              <span>View Store</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#66766D]" />
            </Link>

            {/* Business Notification Indicator */}
            {businessStats && businessStats.totalPendingBusiness > 0 && (
              <Link
                href="/admin/wholesale"
                className="relative p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 transition shadow-2xs flex items-center justify-center"
                title={`${businessStats.totalPendingBusiness} pending business enquiries awaiting review`}
              >
                <Bell className="w-4 h-4 text-amber-700" />
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white font-black text-[9px] flex items-center justify-center shadow-xs animate-pulse">
                  {businessStats.totalPendingBusiness}
                </span>
              </Link>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 rounded-full border border-[#E3E9E5] bg-white hover:ring-2 hover:ring-[#0F6B47]/20 transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[#0F6B47] text-white flex items-center justify-center text-[11px] font-bold">
                  {getInitials(admin.name)}
                </div>
              </button>

              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileOpen(false)}
                    aria-hidden
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#E3E9E5] shadow-xl p-3 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-stone-100">
                      <p className="font-bold text-stone-900 truncate">{admin.name}</p>
                      <p className="text-[11px] text-[#66766D] truncate">{admin.email}</p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#E3F2EA] text-[#0F6B47]">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{admin.role} role</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isPending}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 font-semibold transition disabled:opacity-50 cursor-pointer"
                      >
                        {isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <LogOut className="w-3.5 h-3.5" />
                        )}
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ── Main Scroll Content ────────────────────────────────────────── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* Admin Footer matching reference */}
        <footer className="border-t border-[#E3E9E5] py-4 px-6 text-xs text-[#66766D] flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Yum Nest. All rights reserved.</span>
          <span>Powered by WhatsApp Business &bull; Admin Panel v1.0</span>
        </footer>

      </div>

    </div>
  );
}
