'use client';

/**
 * AdminShell — Master layout shell for the Yumnest admin dashboard.
 * Designed with a clean, minimal Shopify-style aesthetic.
 */

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
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
} from 'lucide-react';
import { logout } from '@/lib/api/auth';
import type { AuthenticatedAdmin } from '@/types/api';

const NAV_ITEMS = [
  { label: 'Overview',      href: '/admin',            icon: LayoutDashboard },
  { label: 'Products',      href: '/admin/products',   icon: Package },
  { label: 'Categories',    href: '/admin/categories', icon: Tags },
  { label: 'Media Library', href: '/admin/media',      icon: Images },
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

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await logout();
      } catch {
        // Best-effort logout; will still redirect
      } finally {
        router.replace('/admin/login');
      }
    });
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (name.slice(0, 2) || 'AD').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 flex flex-col font-sans antialiased selection:bg-[#0F5638]/10">

      {/* ── Top Admin Navbar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 h-14 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
        
        {/* Left: Mobile Toggle + Yumnest Logo & Wordmark + Admin Badge */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="lg:hidden p-1.5 -ml-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-slate-300"
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link
            href="/admin"
            className="flex items-center gap-2.5 group focus:outline-none"
            aria-label="Yumnest Admin Overview"
          >
            <div className="relative h-8 w-8 rounded-md overflow-hidden bg-slate-50 border border-slate-200/80 flex items-center justify-center p-0.5">
              <Image
                src="/assets/yummnext-og-logo.png"
                alt="Yumnest Logo"
                width={32}
                height={32}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif font-bold text-lg text-[#0F5638] tracking-tight group-hover:text-[#187A4F] transition">
                Yumnest
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Admin
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Storefront Link + Authenticated Admin Profile & Sign Out */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* View live store link */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition"
            title="Open customer storefront in a new tab"
          >
            <span>View store</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" aria-hidden />

          {/* Admin User Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-slate-300"
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <div className="w-7 h-7 rounded-full bg-[#0F5638] text-white flex items-center justify-center text-[11px] font-bold shadow-2xs">
                {getInitials(admin.name)}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 leading-tight">
                  {admin.name}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  {admin.role}
                </span>
              </div>
            </button>

            {/* Profile Menu Dropdown Card */}
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                  aria-hidden
                />
                <div className="absolute right-0 mt-2 w-64 rounded-lg bg-white border border-slate-200 shadow-lg p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2.5 border-b border-slate-100">
                    <p className="font-semibold text-slate-900 truncate">{admin.name}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{admin.email}</p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{admin.role} role</span>
                    </div>
                  </div>

                  <div className="pt-1.5">
                    <Link
                      href="/"
                      target="_blank"
                      className="sm:hidden flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-50 text-slate-700 font-medium transition"
                      onClick={() => setProfileOpen(false)}
                    >
                      <span>View live store</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isPending}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-50 text-red-600 font-medium transition disabled:opacity-50"
                    >
                      {isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <LogOut className="w-3.5 h-3.5" />
                      )}
                      <span>{isPending ? 'Signing out…' : 'Sign out'}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Layout Body: Sidebar + Page Content ────────────────────── */}
      <div className="flex-1 flex min-h-[calc(100vh-3.5rem)]">

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-2xs lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <aside
          className={`
            fixed top-14 left-0 z-30 h-[calc(100vh-3.5rem)] w-60 bg-white border-r border-slate-200/90 flex flex-col justify-between
            transform transition-transform duration-150 ease-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:static lg:z-auto
          `}
        >
          {/* Navigation Menu */}
          <nav className="p-3 space-y-1 overflow-y-auto">
            <div className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                    flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition
                    ${isActive
                      ? 'bg-slate-100 text-[#0F5638] font-semibold border-l-2 border-[#0F5638]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}
                  `}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#0F5638]' : 'text-slate-400'}`} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Sidebar: Session details & Sign out */}
          <div className="p-3 border-t border-slate-200/80 bg-slate-50/50 space-y-2">
            <div className="px-2 py-1.5 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="truncate">{admin.email}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span>{isPending ? 'Signing out…' : 'Sign out'}</span>
            </button>
          </div>
        </aside>

        {/* ── Main Content Area ─────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>

    </div>
  );
}
