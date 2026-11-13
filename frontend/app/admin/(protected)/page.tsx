/**
 * Admin Dashboard Overview Page.
 * Visual design follows the Yum Nest Admin design system:
 * - Brand Green (#0F6B47) and Dark Green (#0B4A33)
 * - Light background (#F3F6F4)
 * - White cards, clean borders, Plus Jakarta Sans typography
 * - 100% real database records (no fake/demo data)
 */

import Link from 'next/link';
import { cookies } from 'next/headers';
import { serverApiRequest } from '@/lib/api/client';
import type { AdminProduct, CategoryItem, Order, OrderStats } from '@/types/api';
import {
  ShoppingBag,
  Package,
  Tags,
  Plus,
  ArrowRight,
} from 'lucide-react';

export const instant = false;

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  new: { label: 'New', badgeClass: 'bg-[#0F7A4D] text-white' },
  pending: { label: 'Pending', badgeClass: 'bg-[#FDF0D4] text-[#8F5F08]' },
  confirmed: { label: 'Confirmed', badgeClass: 'bg-[#E7E0FA] text-[#593EAE]' },
  processing: { label: 'Processing', badgeClass: 'bg-[#DCE9FB] text-[#1D57A3]' },
  shipped: { label: 'Shipped', badgeClass: 'bg-[#E0F2FE] text-[#0369A1]' },
  out_for_delivery: { label: 'Out for Delivery', badgeClass: 'bg-[#FEF3C7] text-[#92400E]' },
  delivered: { label: 'Delivered', badgeClass: 'bg-[#D8F0E0] text-[#17673A]' },
  cancelled: { label: 'Cancelled', badgeClass: 'bg-[#FBE1E1] text-[#A02A2A]' },
};

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  // Fetch real data simultaneously from backend APIs
  const [statsRes, ordersRes, productsRes, categoriesRes] = await Promise.all([
    serverApiRequest<OrderStats>('/api/admin/orders/stats', cookieHeader),
    serverApiRequest<Order[]>('/api/admin/orders?limit=6&sortBy=createdAt&sortOrder=desc', cookieHeader),
    serverApiRequest<AdminProduct[]>('/api/admin/products?limit=5&sortBy=createdAt&sortOrder=desc', cookieHeader),
    serverApiRequest<CategoryItem[]>('/api/admin/categories', cookieHeader),
  ]);

  const stats = statsRes?.data;
  const recentOrders = ordersRes?.data || [];
  const products = productsRes?.data || [];
  const categories = categoriesRes?.data || [];

  const totalProducts = productsRes?.meta?.total ?? products.length;
  const totalCategories = categoriesRes?.meta?.total ?? categories.length;

  const totalOrders = stats?.total ?? 0;
  const totalSales = stats?.totalRevenue ?? 0;
  const newOrders = stats?.byStatus?.new ?? 0;
  const pendingOrders = stats?.byStatus?.pending ?? 0;
  const confirmedOrders = stats?.byStatus?.confirmed ?? 0;
  const processingOrders = stats?.byStatus?.processing ?? 0;
  const shippedOrders = stats?.byStatus?.shipped ?? 0;
  const deliveredOrders = stats?.byStatus?.delivered ?? 0;
  const cancelledOrders = stats?.byStatus?.cancelled ?? 0;

  // Determine greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-6">

      {/* ── View Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14261D] tracking-tight">
            {greeting}, Admin
          </h1>
          <p className="text-xs sm:text-sm text-[#66766D] mt-0.5">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E3E9E5] text-xs font-bold text-[#14261D] hover:bg-stone-50 shadow-2xs transition"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#0F6B47]" />
            <span>Manage Orders</span>
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F6B47] hover:bg-[#187A4F] text-white text-xs font-bold shadow-2xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* ── Stats Tiles (4 Column Grid matching Reference Design) ─────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Stat 1: Total Orders */}
        <div className="bg-white rounded-2xl border border-[#E3E9E5] p-4 sm:p-5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-[#E3F2EA] text-[#0F6B47] flex items-center justify-center mb-3">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-[#66766D] block">Total Orders</span>
          <div className="text-2xl sm:text-3xl font-black text-[#14261D] tracking-tight mt-1 font-mono">
            {totalOrders}
          </div>
          <span className="text-[11px] text-[#0F6B47] font-semibold mt-1 block">
            {newOrders > 0 ? `${newOrders} new to confirm` : 'All caught up'}
          </span>
        </div>

        {/* Stat 2: Total Sales */}
        <div className="bg-white rounded-2xl border border-[#E3E9E5] p-4 sm:p-5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-[#FEF6E6] text-[#C47A10] flex items-center justify-center mb-3">
            <span className="text-lg font-black leading-none">₹</span>
          </div>
          <span className="text-xs font-semibold text-[#66766D] block">Total Sales</span>
          <div className="text-2xl sm:text-3xl font-black text-[#14261D] tracking-tight mt-1 font-mono">
            ₹{Number(totalSales).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#66766D] font-medium mt-1 block">
            Fulfilled & in-transit orders
          </span>
        </div>

        {/* Stat 3: Total Products */}
        <div className="bg-white rounded-2xl border border-[#E3E9E5] p-4 sm:p-5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-[#EDF4FD] text-[#2F6BD1] flex items-center justify-center mb-3">
            <Package className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-[#66766D] block">Catalogue Items</span>
          <div className="text-2xl sm:text-3xl font-black text-[#14261D] tracking-tight mt-1 font-mono">
            {totalProducts}
          </div>
          <span className="text-[11px] text-[#2F6BD1] font-semibold mt-1 block">
            Active in storefront
          </span>
        </div>

        {/* Stat 4: Categories */}
        <div className="bg-white rounded-2xl border border-[#E3E9E5] p-4 sm:p-5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-[#F3EFFC] text-[#6D44CF] flex items-center justify-center mb-3">
            <Tags className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-[#66766D] block">Categories</span>
          <div className="text-2xl sm:text-3xl font-black text-[#14261D] tracking-tight mt-1 font-mono">
            {totalCategories}
          </div>
          <span className="text-[11px] text-[#6D44CF] font-semibold mt-1 block">
            Product groupings
          </span>
        </div>

      </div>

      {/* ── Status Counts Ribbon ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E3E9E5] p-3 sm:p-4 shadow-sm flex flex-wrap items-center gap-2 text-xs">
        <span className="font-bold text-[#14261D] mr-1">Status Overview:</span>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold bg-[#E3F2EA] text-[#0F6B47] hover:brightness-95 transition"
        >
          <span>New: {newOrders}</span>
        </Link>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold bg-[#FEF6E6] text-[#8F5F08] hover:brightness-95 transition"
        >
          <span>Pending: {pendingOrders}</span>
        </Link>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold bg-[#F3EFFC] text-[#593EAE] hover:brightness-95 transition"
        >
          <span>Confirmed: {confirmedOrders}</span>
        </Link>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold bg-[#EDF4FD] text-[#1D57A3] hover:brightness-95 transition"
        >
          <span>Processing: {processingOrders}</span>
        </Link>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold bg-[#F0F9FF] text-[#0369A1] hover:brightness-95 transition"
        >
          <span>Shipped: {shippedOrders}</span>
        </Link>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold bg-[#EAF7EF] text-[#17673A] hover:brightness-95 transition"
        >
          <span>Delivered: {deliveredOrders}</span>
        </Link>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold bg-[#FDF0F0] text-[#A02A2A] hover:brightness-95 transition"
        >
          <span>Cancelled: {cancelledOrders}</span>
        </Link>
      </div>

      {/* ── Recent Orders Section (Full Available Space) ─────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E3E9E5] shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E3E9E5] flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#14261D]">
              Recent Orders
            </h2>
            <p className="text-xs text-[#66766D]">
              Latest customer orders recorded in your database
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-[#0F6B47] hover:text-[#187A4F] inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-full bg-[#E3F2EA] text-[#0F6B47] flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#14261D]">No orders yet</p>
            <p className="text-xs text-[#66766D] max-w-sm mx-auto">
              When customers check out on your store, their orders will appear here automatically with their unique Order ID and contact details.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Order Cards (screens < 768px) */}
            <div className="divide-y divide-[#E3E9E5] md:hidden">
              {recentOrders.map((order) => {
                const statusConf = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.new;
                const totalQty = order.items.reduce((s, it) => s + it.quantity, 0);

                return (
                  <div key={order.id || order.orderNumber} className="p-3.5 space-y-2 hover:bg-[#F7FAF8] transition">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-[#0B4A33]">
                        #{order.orderNumber}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${statusConf.badgeClass}`}
                      >
                        {statusConf.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-xs text-[#14261D]">{order.customerName}</p>
                        <p className="text-[11px] text-[#66766D] font-mono">{order.phone}</p>
                      </div>
                      <span className="font-bold text-sm text-stone-900">₹{order.totalAmount}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-dashed border-[#E3E9E5]/60 text-xs">
                      <span className="text-[11px] text-[#66766D] truncate max-w-[200px]">
                        {totalQty} {totalQty === 1 ? 'item' : 'items'} &bull; {order.items.map((i) => i.productName).join(', ')}
                      </span>
                      <Link
                        href="/admin/orders"
                        className="font-bold text-[#0F6B47] hover:underline shrink-0 ml-2"
                      >
                        Manage &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (screens >= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E3E9E5] bg-[#F7FAF8] text-[#66766D] font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4"># Order</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E9E5] text-[#14261D]">
                  {recentOrders.map((order) => {
                    const statusConf = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.new;
                    const totalQty = order.items.reduce((s, it) => s + it.quantity, 0);

                    return (
                      <tr key={order.id || order.orderNumber} className="hover:bg-[#F7FAF8] transition">
                        <td className="py-3 px-4 font-mono font-bold text-[#0B4A33] whitespace-nowrap">
                          #{order.orderNumber}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#14261D] whitespace-nowrap">
                          {order.customerName}
                          <span className="block text-[11px] text-[#66766D] font-mono font-normal">
                            {order.phone}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#66766D]">
                          <span className="font-semibold text-[#14261D] whitespace-nowrap">
                            {totalQty} {totalQty === 1 ? 'item' : 'items'}
                          </span>
                          <span className="block text-[11px] truncate max-w-[200px] text-[#66766D]">
                            {order.items.map((i) => i.productName).join(', ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-stone-900 whitespace-nowrap">
                          ₹{order.totalAmount}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${statusConf.badgeClass}`}
                          >
                            {statusConf.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Link
                            href="/admin/orders"
                            className="text-xs font-semibold text-[#0F6B47] hover:underline"
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Balanced Summary Cards (Categories & Catalogue Highlights) ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Quick Category Summary */}
        <div className="bg-white rounded-2xl border border-[#E3E9E5] p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E3E9E5]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#F3EFFC] text-[#6D44CF] flex items-center justify-center">
                <Tags className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#14261D]">Categories</h3>
            </div>
            <Link href="/admin/categories" className="text-xs font-semibold text-[#0F6B47] hover:underline">
              Manage
            </Link>
          </div>

          {categories.length === 0 ? (
            <p className="text-xs text-[#66766D] text-center py-4">No categories yet.</p>
          ) : (
            <div className="space-y-2">
              {categories.slice(0, 5).map((c) => (
                <div key={c.id || c._id} className="flex items-center justify-between text-xs py-1.5 border-b border-[#F7FAF8] last:border-0">
                  <span className="font-medium text-[#14261D] truncate">{c.name}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-[#66766D]">
                    {c.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Catalogue Summary */}
        <div className="bg-white rounded-2xl border border-[#E3E9E5] p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E3E9E5]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#EDF4FD] text-[#2F6BD1] flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#14261D]">Storefront Products</h3>
            </div>
            <Link href="/admin/products" className="text-xs font-semibold text-[#0F6B47] hover:underline">
              Manage
            </Link>
          </div>

          {products.length === 0 ? (
            <p className="text-xs text-[#66766D] text-center py-4">No products added yet.</p>
          ) : (
            <div className="space-y-2">
              {products.slice(0, 5).map((p) => {
                const price = p.variants?.[0]?.price ?? 0;
                return (
                  <div key={p.id} className="flex items-center justify-between text-xs py-1.5 border-b border-[#F7FAF8] last:border-0">
                    <span className="font-medium text-[#14261D] truncate max-w-[200px]">{p.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-[#14261D]">₹{price}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-[#66766D]">
                        {p.isActive ? 'Active' : 'Archived'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
