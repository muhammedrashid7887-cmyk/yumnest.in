'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import {
  Plus,
  Search,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Archive,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  archiveProduct,
} from '@/lib/api/products';
import type { AdminProduct, CategoryItem, ProductInput, ProductUpdateInput } from '@/types/api';
import { ApiRequestError } from '@/types/api';

interface ProductManagerProps {
  initialProducts: AdminProduct[];
  categories: CategoryItem[];
  initialTotal: number;
}

export function ProductManager({
  initialProducts,
  categories,
  initialTotal,
}: ProductManagerProps) {
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Create Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [desc, setDesc] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [variantName, setVariantName] = useState('Standard Pack (100g)');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState<number>(150);
  const [compareAtPrice, setCompareAtPrice] = useState<number | undefined>(undefined);
  const [stock, setStock] = useState<number>(50);
  const [unit, setUnit] = useState('g');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Notice Banner
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async (newPage = page, querySearch = search, cat = selectedCat, stat = statusFilter) => {
    setIsLoading(true);
    try {
      const activeParam = stat === 'all' ? undefined : stat === 'true';
      const res = await fetchProducts({
        page: newPage,
        limit: 10,
        search: querySearch || undefined,
        category: cat || undefined,
        isActive: activeParam,
      });
      setProducts(res.data);
      if (res.meta) setTotal(res.meta.total);
      setPage(newPage);
    } catch (err) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to query products.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(1, search, selectedCat, statusFilter);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSlug('');
    setShortDesc('');
    setDesc('');
    setCategoryId(categories[0]?.id || categories[0]?._id || '');
    setVariantName('Standard Pack (100g)');
    setSku(`YN-${Date.now().toString().slice(-5)}`);
    setPrice(150);
    setCompareAtPrice(undefined);
    setStock(50);
    setUnit('g');
    setIsActive(true);
    setIsFeatured(false);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (p: AdminProduct) => {
    setEditingProduct(p);
    setName(p.name);
    setSlug(p.slug);
    setShortDesc(p.shortDescription || '');
    setDesc(p.description || '');
    const catId = typeof p.category === 'object' && p.category ? p.category.id : String(p.category || '');
    setCategoryId(catId);
    const v = p.variants?.[0];
    setVariantName(v?.variantName || 'Standard');
    setSku(v?.sku || '');
    setPrice(v?.price ?? 0);
    setCompareAtPrice(v?.compareAtPrice);
    setStock(v?.stockQuantity ?? 0);
    setUnit(v?.unit || 'g');
    setIsActive(p.isActive);
    setIsFeatured(p.isFeatured);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setFormError('Product name is required.');
    if (!shortDesc.trim()) return setFormError('Short description is required.');
    if (!desc.trim()) return setFormError('Full description is required.');
    if (!categoryId) return setFormError('Please select a category.');
    if (!sku.trim()) return setFormError('Variant SKU is required.');
    if (price < 0) return setFormError('Price must be greater than or equal to 0.');
    if (compareAtPrice !== undefined && compareAtPrice < price) {
      return setFormError('Compare-at price must be greater than or equal to regular price.');
    }

    setFormError(null);

    startTransition(async () => {
      try {
        if (editingProduct) {
          const existingVariant = editingProduct.variants?.[0];
          const updatePayload: ProductUpdateInput = {
            name: name.trim(),
            slug: slug.trim() || undefined,
            shortDescription: shortDesc.trim(),
            description: desc.trim(),
            category: categoryId,
            variants: [
              {
                id: existingVariant?.id || existingVariant?._id,
                variantName: variantName.trim() || 'Standard',
                sku: sku.trim().toUpperCase(),
                price: Number(price),
                compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
                unit: unit.trim() || 'g',
                isActive: true,
              },
            ],
            isActive,
            isFeatured,
          };
          const updated = await updateProduct(editingProduct.id, updatePayload);
          setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
          setNotice({ type: 'success', message: `Product "${updated.name}" updated successfully.` });
        } else {
          const payload: ProductInput = {
            name: name.trim(),
            slug: slug.trim() || undefined,
            shortDescription: shortDesc.trim(),
            description: desc.trim(),
            category: categoryId,
            variants: [
              {
                variantName: variantName.trim() || 'Standard',
                sku: sku.trim().toUpperCase(),
                price: Number(price),
                compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
                stockQuantity: Number(stock),
                unit: unit.trim() || 'g',
                isActive: true,
              },
            ],
            isActive,
            isFeatured,
          };
          const created = await createProduct(payload);
          setProducts((prev) => [created, ...prev]);
          setTotal((prev) => prev + 1);
          setNotice({ type: 'success', message: `Product "${created.name}" created successfully.` });
        }

        setModalOpen(false);
      } catch (err) {
        if (err instanceof ApiRequestError) {
          setFormError(err.message);
        } else {
          setFormError('Failed to save product. Please check input values.');
        }
      }
    });
  };

  const handleArchive = (product: AdminProduct) => {
    if (!confirm(`Are you sure you want to archive "${product.name}"? This will hide it from the storefront.`)) {
      return;
    }

    startTransition(async () => {
      try {
        await archiveProduct(product.id);
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, isActive: false } : p))
        );
        setNotice({ type: 'success', message: `Product "${product.name}" was archived.` });
      } catch (err) {
        setNotice({
          type: 'error',
          message: err instanceof Error ? err.message : 'Could not archive product.',
        });
      }
    });
  };

  const totalPages = Math.ceil(total / 10) || 1;

  return (
    <div className="space-y-4">

      {/* ── Notice Banner ─────────────────────────────────────────────── */}
      {notice && (
        <div
          role="alert"
          className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            )}
            <span>{notice.message}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Search and Filter Controls ─────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-3 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex flex-col sm:flex-row items-center gap-2 w-full">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#12372A]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCat}
              onChange={(e) => {
                setSelectedCat(e.target.value);
                loadData(1, search, e.target.value, statusFilter);
              }}
              className="px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#12372A]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id || c._id} value={c.id || c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                const val = e.target.value as 'all' | 'true' | 'false';
                setStatusFilter(val);
                loadData(1, search, selectedCat, val);
              }}
              className="px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#12372A]"
            >
              <option value="all">All Status</option>
              <option value="true">Active</option>
              <option value="false">Archived</option>
            </select>
          </div>
        </form>

        <button
          type="button"
          onClick={openCreateModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-[#12372A] hover:bg-[#1A4D3B] text-white text-xs font-semibold shadow-2xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add product</span>
        </button>
      </div>

      {/* ── Products Table ────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex items-center justify-center text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span>Loading products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
              <Package className="w-4 h-4" />
            </div>
            <p className="font-semibold text-slate-700">No products match your filters</p>
            <p className="text-slate-400">Try adjusting your search criteria or add a new spice product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-4">Product</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Stock</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {products.map((p) => {
                  const catName =
                    typeof p.category === 'object' && p.category
                      ? p.category.name
                      : 'Unassigned';
                  const baseVariant = p.variants?.[0];
                  const totalStock = p.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) ?? 0;
                  const primaryImg = p.primaryImage || p.images?.[0]?.url;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden relative">
                          {primaryImg ? (
                            <Image
                              src={primaryImg}
                              alt={p.name}
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
                          <p className="font-semibold text-slate-900 truncate max-w-[220px]">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono truncate">
                            SKU: {baseVariant?.sku || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-600">
                        {catName}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        ₹{baseVariant?.price ?? 0}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`font-medium ${totalStock > 0 ? 'text-slate-700' : 'text-red-600'}`}>
                          {totalStock} in stock
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            p.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Archived'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="px-2 py-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition"
                        >
                          Edit
                        </button>
                        {p.isActive && (
                          <button
                            type="button"
                            onClick={() => handleArchive(p)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Archive product"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination Bar ───────────────────────────────────────────── */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total items)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() => loadData(page - 1)}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages || isLoading}
              onClick={() => loadData(page + 1)}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Create / Edit Product Modal ───────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs overflow-y-auto">
          <div className="w-full max-w-xl my-8 bg-white rounded-lg border border-slate-200 shadow-xl p-5 text-xs space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tellicherry Black Pepper"
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#12372A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Slug (URL identifier)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="auto-generated if left blank"
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#12372A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#12372A]"
                >
                  <option value="">Select a category...</option>
                  {categories.map((c) => (
                    <option key={c.id || c._id} value={c.id || c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Short Description * (Summary for catalogue)
                </label>
                <input
                  type="text"
                  required
                  maxLength={500}
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="One or two sentences summarizing the product"
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#12372A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Detailed product story, origin, and culinary guidance..."
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#12372A]"
                />
              </div>

              {/* Variant Pricing & Stock Subcard */}
              <div className="bg-slate-50/80 rounded-md border border-slate-200/80 p-3 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                  Primary Variant &amp; Inventory
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-0.5 font-medium">Variant Name</label>
                    <input
                      type="text"
                      required
                      value={variantName}
                      onChange={(e) => setVariantName(e.target.value)}
                      placeholder="e.g. 100g Pouch"
                      className="w-full px-2.5 py-1 rounded border border-slate-200 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-0.5 font-medium">SKU *</label>
                    <input
                      type="text"
                      required
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="YN-PEP-100"
                      className="w-full px-2.5 py-1 rounded border border-slate-200 text-xs uppercase bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-0.5 font-medium">Unit</label>
                    <input
                      type="text"
                      required
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="g / ml / box"
                      className="w-full px-2.5 py-1 rounded border border-slate-200 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-0.5 font-medium">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full px-2.5 py-1 rounded border border-slate-200 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-0.5 font-medium">Compare At (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={compareAtPrice ?? ''}
                      onChange={(e) => setCompareAtPrice(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Original price"
                      className="w-full px-2.5 py-1 rounded border border-slate-200 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-0.5 font-medium">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      disabled={Boolean(editingProduct)}
                      className={`w-full px-2.5 py-1 rounded border border-slate-200 text-xs ${editingProduct ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'}`}
                      title={editingProduct ? 'Stock cannot be modified via product edit (managed via inventory adjustments)' : undefined}
                    />
                    {editingProduct && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">Inventory locked in edit</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-slate-300 text-[#12372A] focus:ring-[#12372A]"
                  />
                  <span className="font-semibold text-slate-700">Active (Visible in Store)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-slate-300 text-[#12372A] focus:ring-[#12372A]"
                  />
                  <span className="font-semibold text-slate-700">Featured</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#12372A] hover:bg-[#1A4D3B] text-white font-semibold shadow-2xs transition disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProduct ? 'Update Product' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
