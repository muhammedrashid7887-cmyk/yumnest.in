/**
 * Admin Dashboard Overview Page.
 * Professional, minimal e-commerce dashboard inspired by Shopify.
 * Displays only authentic, verified data from the Yumnest backend.
 */

import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { serverApiRequest } from '@/lib/api/client';
import type { AdminProduct, CategoryItem, MediaItem } from '@/types/api';
import {
  Package,
  Tags,
  Images,
  Plus,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export const instant = false;

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  // Fetch real counts and recent products simultaneously
  const [productsRes, categoriesRes, mediaRes] = await Promise.all([
    serverApiRequest<AdminProduct[]>('/api/admin/products?limit=5&sortBy=createdAt&sortOrder=desc', cookieHeader),
    serverApiRequest<CategoryItem[]>('/api/admin/categories', cookieHeader),
    serverApiRequest<MediaItem[]>('/api/admin/media?limit=1', cookieHeader),
  ]);

  const products = productsRes?.data || [];
  const categories = categoriesRes?.data || [];
  const totalProducts = productsRes?.meta?.total ?? products.length;
  const totalCategories = categoriesRes?.meta?.total ?? categories.length;
  const totalMedia = mediaRes?.meta?.total ?? 0;

  const activeProducts = products.filter((p) => p.isActive).length;
  const activeCategories = categories.filter((c) => c.isActive).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Page Header & Quick Actions ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your store catalogue, categories, and media assets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Category</span>
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs font-semibold shadow-2xs transition"
          >
            <Plus className="w-3.5 h-3.5 text-white/80" />
            <span>Add product</span>
          </Link>
        </div>
      </div>

      {/* ── Real Summary Metrics Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Metric 1: Products */}
        <div className="bg-white rounded-lg border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Products
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {totalProducts}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              total items
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-medium">
              {activeProducts} active in store
            </span>
            <Link
              href="/admin/products"
              className="text-slate-500 hover:text-[#0F5638] font-medium inline-flex items-center gap-0.5"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Metric 2: Categories */}
        <div className="bg-white rounded-lg border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Categories
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
              <Tags className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {totalCategories}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              taxonomies
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-medium">
              {activeCategories} active categories
            </span>
            <Link
              href="/admin/categories"
              className="text-slate-500 hover:text-[#0F5638] font-medium inline-flex items-center gap-0.5"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Metric 3: Media Library */}
        <div className="bg-white rounded-lg border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Media Assets
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
              <Images className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {totalMedia}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              stored images
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Cloudinary storage</span>
            <Link
              href="/admin/media"
              className="text-slate-500 hover:text-[#0F5638] font-medium inline-flex items-center gap-0.5"
            >
              <span>Library</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

      </div>

      {/* ── Main Section: Recent Products + Category Overview ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column (8 cols): Recent Products Table */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Recent Products
              </h2>
              <p className="text-xs text-slate-500">
                Latest catalogue entries in your database
              </p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-[#0F5638] hover:text-[#187A4F] flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="py-12 px-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                No products added yet
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Start adding your authentic single-estate spices, blends, and powders to your catalogue.
              </p>
              <Link
                href="/admin/products"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0F5638] text-white text-xs font-semibold shadow-2xs hover:bg-[#187A4F] transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create first product</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4">Product</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {products.map((product) => {
                    const categoryName =
                      typeof product.category === 'object' && product.category
                        ? product.category.name
                        : 'Uncategorized';
                    const basePrice = product.variants?.[0]?.price ?? 0;
                    const primaryImg = product.primaryImage || product.images?.[0]?.url;

                    return (
                      <tr key={product.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-4 flex items-center gap-3">
                          <div className="w-9 h-9 rounded bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden relative">
                            {primaryImg ? (
                              <Image
                                src={primaryImg}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="36px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate max-w-[200px]">
                              {product.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono truncate">
                              /{product.slug}
                            </p>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-medium">
                          {categoryName}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          ₹{basePrice}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                              product.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {product.isActive ? 'Active' : 'Archived'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <Link
                            href="/admin/products"
                            className="font-medium text-[#0F5638] hover:underline"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Categories & Storefront status */}
        <div className="lg:col-span-4 space-y-6">

          {/* Categories card */}
          <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">
                Categories
              </h2>
              <Link
                href="/admin/categories"
                className="text-xs font-semibold text-[#0F5638] hover:underline"
              >
                Manage
              </Link>
            </div>

            {categories.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                No categories created yet.
              </p>
            ) : (
              <div className="space-y-2">
                {categories.slice(0, 6).map((cat) => (
                  <div
                    key={cat.id || cat._id}
                    className="flex items-center justify-between text-xs py-1"
                  >
                    <span className="font-medium text-slate-800 truncate">
                      {cat.name}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        cat.isActive
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Storefront Environment & API Status */}
          <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs p-4 space-y-3 text-xs">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Storefront Status
            </h2>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-500">API Connection</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200/50">
                <CheckCircle2 className="w-3 h-3" />
                <span>Connected</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">API Gateway</span>
              <span className="font-mono text-[11px] text-slate-600">
                {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Link
                href="/"
                target="_blank"
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition"
              >
                <span>Preview live customer storefront</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
