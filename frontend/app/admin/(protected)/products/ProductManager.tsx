'use client';

import React, { useState, useTransition, useRef } from 'react';
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
  Upload,
  ImageIcon,
  Trash2,
  Star,
} from 'lucide-react';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  archiveProduct,
  updateProductStatus,
  uploadProductImage,
} from '@/lib/api/products';
import type {
  AdminProduct,
  CategoryItem,
  ProductImageInput,
  ProductInput,
  ProductUpdateInput,
} from '@/types/api';
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

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [malayalamName, setMalayalamName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('');
  const [tags, setTags] = useState('');
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

  // Images state
  const [images, setImages] = useState<ProductImageInput[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setMalayalamName('');
    setSubtitle('');
    setBadge('');
    setTags('');
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
    setImages([]);
    setImageUrlInput('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (p: AdminProduct) => {
    setEditingProduct(p);
    setName(p.name);
    setMalayalamName(p.malayalamName || '');
    setSubtitle(p.subtitle || '');
    setBadge(p.badge || '');
    setTags(Array.isArray(p.tags) ? p.tags.join(', ') : '');
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

    // Populate images
    if (p.images && p.images.length > 0) {
      setImages(
        p.images.map((img, idx) => ({
          mediaId: img.mediaId,
          url: img.url,
          secureUrl: img.secureUrl || img.url,
          publicId: img.publicId,
          sortOrder: img.sortOrder ?? idx,
          altText: img.altText || p.name,
        }))
      );
    } else if (p.primaryImage) {
      setImages([
        {
          url: p.primaryImage,
          secureUrl: p.primaryImage,
          sortOrder: 0,
          altText: p.name,
        },
      ]);
    } else {
      setImages([]);
    }

    setImageUrlInput('');
    setFormError(null);
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setFormError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      const uploaded = await uploadProductImage(formData);

      setImages((prev) => [
        ...prev,
        {
          mediaId: uploaded.mediaId,
          url: uploaded.url,
          secureUrl: uploaded.secureUrl,
          publicId: uploaded.publicId,
          width: uploaded.width,
          height: uploaded.height,
          format: uploaded.format,
          sortOrder: prev.length,
          altText: name || 'Product image',
        },
      ]);

      setNotice({
        type: 'success',
        message: 'Image uploaded to Cloudinary successfully.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setFormError(
        `Cloudinary upload: ${msg}. If Cloudinary credentials are not configured in backend/.env, you can also paste a direct image URL below.`
      );
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;

    try {
      new URL(trimmed);
    } catch {
      setFormError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setImages((prev) => [
      ...prev,
      {
        url: trimmed,
        secureUrl: trimmed,
        sortOrder: prev.length,
        altText: name || 'Product image',
      },
    ]);
    setImageUrlInput('');
    setFormError(null);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMakePrimary = (index: number) => {
    setImages((prev) => {
      const selected = prev[index];
      const remainder = prev.filter((_, idx) => idx !== index);
      return [selected, ...remainder];
    });
  };

  const handleToggleStatus = (product: AdminProduct) => {
    const nextStatus = !product.isActive;
    startTransition(async () => {
      try {
        const updated = await updateProductStatus(product.id, nextStatus);
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, isActive: updated.isActive } : p))
        );
        setNotice({
          type: 'success',
          message: `Product "${product.name}" is now ${nextStatus ? 'Active' : 'Archived'}.`,
        });
      } catch (err) {
        setNotice({
          type: 'error',
          message: err instanceof Error ? err.message : 'Could not change product status.',
        });
      }
    });
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

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const imagePayload = images.map((img, idx) => ({
      mediaId: img.mediaId,
      url: img.url,
      secureUrl: img.secureUrl || img.url,
      publicId: img.publicId,
      width: img.width,
      height: img.height,
      format: img.format,
      altText: img.altText || name.trim(),
      sortOrder: idx,
    }));

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
            images: imagePayload,
            malayalamName: malayalamName.trim() || undefined,
            badge: badge.trim() || undefined,
            tags: parsedTags.length > 0 ? parsedTags : undefined,
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
            images: imagePayload,
            malayalamName: malayalamName.trim() || undefined,
            badge: badge.trim() || undefined,
            tags: parsedTags.length > 0 ? parsedTags : undefined,
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
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
            aria-label="Dismiss notice"
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
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-[#12372A] hover:bg-[#1A4D3B] text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
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
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-slate-900 truncate max-w-[200px]">
                              {p.name}
                            </p>
                            {p.isFeatured && (
                              <span
                                title="Featured Product"
                                className="inline-flex items-center text-amber-500"
                              >
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              </span>
                            )}
                          </div>
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
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          title={`Click to ${p.isActive ? 'archive' : 'activate'} this product`}
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider transition cursor-pointer ${
                            p.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Archived'}
                        </button>
                      </td>
                      <td className="py-2.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="px-2 py-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition cursor-pointer"
                        >
                          Edit
                        </button>
                        {p.isActive && (
                          <button
                            type="button"
                            onClick={() => handleArchive(p)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
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
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages || isLoading}
              onClick={() => loadData(page + 1)}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
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
          <div className="w-full max-w-2xl my-8 bg-white rounded-lg border border-slate-200 shadow-xl p-5 text-xs space-y-4 animate-in fade-in zoom-in-95 duration-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Product Titles & Malayalam */}
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
                    Malayalam Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={malayalamName}
                    onChange={(e) => setMalayalamName(e.target.value)}
                    placeholder="e.g. തലശ്ശേരി കുരുമുളക്"
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#12372A]"
                  />
                </div>
              </div>

              {/* Subtitle & Badge */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Extra Bold Single-Estate Peppercorns"
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#12372A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Promo Badge (Optional)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Best Seller / Single Estate / 100% Pure"
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#12372A]"
                  />
                </div>
              </div>

              {/* Category & Slug */}
              <div className="grid sm:grid-cols-2 gap-3">
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

              {/* Descriptions */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Short Description * (Catalogue summary)
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

              {/* ── Cloudinary Image Upload & Gallery Management ──────── */}
              <div className="bg-slate-50/80 rounded-md border border-slate-200/80 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                    Product Images ({images.length})
                  </span>
                  <span className="text-[10px] text-slate-400">
                    First image is Primary thumbnail
                  </span>
                </div>

                {/* Gallery Preview Strip */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-md border border-slate-200 bg-white overflow-hidden group shadow-2xs"
                      >
                        <div className="aspect-square relative w-full bg-slate-100">
                          <Image
                            src={img.url}
                            alt={img.altText || 'Product preview'}
                            fill
                            className="object-cover"
                            sizes="120px"
                          />
                        </div>
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-[#12372A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
                            Primary
                          </span>
                        )}
                        <div className="p-1 bg-white flex items-center justify-between border-t border-slate-100">
                          {idx !== 0 ? (
                            <button
                              type="button"
                              onClick={() => handleMakePrimary(idx)}
                              className="text-[10px] text-slate-600 hover:text-[#12372A] font-semibold cursor-pointer"
                            >
                              Make primary
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-700 font-semibold">
                              Main
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                            title="Remove image"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload from Computer & URL Fallback */}
                <div className="space-y-2 pt-1 border-t border-slate-200/60">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <label className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-white border border-dashed border-slate-300 hover:border-[#12372A] text-slate-700 hover:text-[#12372A] cursor-pointer transition font-medium text-xs">
                      {isUploadingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#12372A]" />
                      ) : (
                        <Upload className="w-4 h-4 text-slate-400" />
                      )}
                      <span>
                        {isUploadingImage
                          ? 'Uploading to Cloudinary...'
                          : 'Upload file to Cloudinary'}
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        disabled={isUploadingImage}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <span className="text-[11px] text-slate-400 text-center sm:text-left">
                      or
                    </span>

                    <div className="flex-1 flex items-center gap-1">
                      <div className="relative flex-1">
                        <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          placeholder="Paste image URL..."
                          className="w-full pl-7 pr-2 py-1.5 rounded-md border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#12372A]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                      >
                        Add URL
                      </button>
                    </div>
                  </div>
                </div>
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
                      className={`w-full px-2.5 py-1 rounded border border-slate-200 text-xs ${
                        editingProduct ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'
                      }`}
                      title={
                        editingProduct
                          ? 'Stock cannot be modified via product edit (managed via inventory adjustments)'
                          : undefined
                      }
                    />
                    {editingProduct && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">Inventory locked in edit</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. spice, pepper, organic, malabar"
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#12372A]"
                />
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
                  className="px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || isUploadingImage}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#12372A] hover:bg-[#1A4D3B] text-white font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
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
