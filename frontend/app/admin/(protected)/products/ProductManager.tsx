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
  Image as ImageIcon,
  DollarSign,
  Sparkles,
  Pencil,
  Trash2,
  Tag,
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
  const [badge, setBadge] = useState('');
  const [features, setFeatures] = useState('');
  const [frontImage, setFrontImage] = useState('');
  const [sideImage, setSideImage] = useState('');
  const [backImage, setBackImage] = useState('');

  // Pricing & Pack Sizes State (Matching Reference in Yumnest Design)
  const [regularPrice, setRegularPrice] = useState<number>(200);
  const [offerPrice, setOfferPrice] = useState<number>(175);
  const [packSizes, setPackSizes] = useState<Array<{ id?: string; size: string; price: number; sku?: string }>>([
    { size: '100g', price: 175 },
  ]);
  const [editingPackIndex, setEditingPackIndex] = useState<number | null>(null);
  const [editSize, setEditSize] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [isAddingPack, setIsAddingPack] = useState(false);
  const [newSize, setNewSize] = useState('');
  const [newPrice, setNewPrice] = useState<number>(0);

  // Stock Management State
  const [stockStatus, setStockStatus] = useState<'in_stock' | 'out_of_stock'>('in_stock');
  const [stock, setStock] = useState<number>(100);
  const [sku, setSku] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  // Live Discount Percentage Calculation
  const discountPercent =
    regularPrice > 0 && offerPrice >= 0 && regularPrice > offerPrice
      ? Math.round(((regularPrice - offerPrice) / regularPrice) * 100)
      : 0;

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

  const handleAddPackSize = () => {
    if (!newSize.trim()) return;
    const p = Number(newPrice) > 0 ? Number(newPrice) : offerPrice;
    setPackSizes([...packSizes, { size: newSize.trim(), price: p }]);
    setNewSize('');
    setNewPrice(0);
    setIsAddingPack(false);
  };

  const startEditPack = (index: number) => {
    setEditingPackIndex(index);
    setEditSize(packSizes[index].size);
    setEditPrice(packSizes[index].price);
  };

  const handleSavePackEdit = (index: number) => {
    if (!editSize.trim()) return;
    const updated = [...packSizes];
    updated[index] = { ...updated[index], size: editSize.trim(), price: Number(editPrice) };
    setPackSizes(updated);
    setEditingPackIndex(null);
  };

  const handleDeletePack = (index: number) => {
    if (packSizes.length <= 1) {
      alert('At least one pack size is required.');
      return;
    }
    setPackSizes(packSizes.filter((_, i) => i !== index));
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
    setBadge('');
    setFeatures('');
    setFrontImage('');
    setSideImage('');
    setBackImage('');
    setCategoryId(categories[0]?.id || categories[0]?._id || '');
    setRegularPrice(200);
    setOfferPrice(175);
    setPackSizes([{ size: '100g', price: 175 }]);
    setStockStatus('in_stock');
    setStock(100);
    setSku(`YN-${Date.now().toString().slice(-5)}`);
    setIsAddingPack(false);
    setEditingPackIndex(null);
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

    const firstVariant = p.variants?.[0];
    const basePrice = firstVariant?.price ?? 0;
    const compPrice = firstVariant?.compareAtPrice ?? basePrice;
    setOfferPrice(basePrice);
    setRegularPrice(compPrice > 0 ? compPrice : basePrice);

    if (p.variants && p.variants.length > 0) {
      setPackSizes(
        p.variants.map((v) => ({
          id: v.id || v._id,
          size: v.variantName || '100g',
          price: v.price ?? 0,
          sku: v.sku,
        }))
      );
    } else {
      setPackSizes([{ size: '100g', price: basePrice }]);
    }

    const totalStock = p.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) ?? 100;
    setStock(totalStock);
    setStockStatus(p.isActive && totalStock > 0 ? 'in_stock' : 'out_of_stock');
    setSku(firstVariant?.sku || `YN-${Date.now().toString().slice(-5)}`);

    // Extract badge and features from tags
    const allTags = p.tags || [];
    setBadge(allTags[0] || '');
    setFeatures(allTags.slice(1).join(', '));

    // Extract Front, Side, Back images
    setFrontImage(p.images?.[0]?.url || p.primaryImage || '');
    setSideImage(p.images?.[1]?.url || '');
    setBackImage(p.images?.[2]?.url || '');

    setIsAddingPack(false);
    setEditingPackIndex(null);
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
    if (!shortDesc.trim()) return setFormError('Subtitle is required.');
    if (!desc.trim()) return setFormError('Full description is required.');
    if (!categoryId) return setFormError('Please select a category.');
    if (regularPrice < 0) return setFormError('Regular price must be greater than or equal to 0.');
    if (offerPrice < 0) return setFormError('Offer price must be greater than or equal to 0.');
    if (regularPrice > 0 && offerPrice > regularPrice) {
      return setFormError('Offer price cannot be greater than regular price.');
    }
    if (packSizes.length === 0) {
      return setFormError('At least one pack size is required.');
    }

    setFormError(null);

    // Build images array
    const builtImages: Array<{ url: string; sortOrder: number; altText?: string }> = [];
    if (frontImage.trim()) {
      builtImages.push({ url: frontImage.trim(), sortOrder: 0, altText: `${name.trim()} Front View` });
    }
    if (sideImage.trim()) {
      builtImages.push({ url: sideImage.trim(), sortOrder: 1, altText: `${name.trim()} Side View` });
    }
    if (backImage.trim()) {
      builtImages.push({ url: backImage.trim(), sortOrder: 2, altText: `${name.trim()} Back View` });
    }

    // Build tags (badge + features)
    const featureList = features
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);
    const combinedTags = [
      ...(badge.trim() ? [badge.trim()] : []),
      ...featureList,
    ];

    const baseSku = sku.trim().toUpperCase() || `YN-${Date.now().toString().slice(-5)}`;
    const effectiveIsActive = stockStatus === 'in_stock';

    // Build variants from packSizes
    const builtVariants = packSizes.map((ps, idx) => ({
      id: ps.id,
      variantName: ps.size.trim() || 'Standard Pack',
      sku: ps.sku || (idx === 0 ? baseSku : `${baseSku}-${ps.size.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || idx + 1}`),
      price: Number(ps.price),
      compareAtPrice: regularPrice > ps.price ? Number(regularPrice) : undefined,
      stockQuantity: stockStatus === 'out_of_stock' ? 0 : Number(stock),
      unit: ps.size.replace(/[0-9.]/g, '').trim() || 'g',
      isActive: effectiveIsActive,
    }));

    startTransition(async () => {
      try {
        if (editingProduct) {
          const updatePayload: ProductUpdateInput = {
            name: name.trim(),
            slug: slug.trim() || undefined,
            shortDescription: shortDesc.trim(),
            description: desc.trim(),
            category: categoryId,
            images: builtImages.length > 0 ? builtImages : undefined,
            variants: builtVariants,
            tags: combinedTags,
            isActive: effectiveIsActive,
            isFeatured: editingProduct.isFeatured ?? false,
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
            images: builtImages.length > 0 ? builtImages : undefined,
            variants: builtVariants,
            tags: combinedTags,
            isActive: effectiveIsActive,
            isFeatured: false,
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
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCat}
              onChange={(e) => {
                setSelectedCat(e.target.value);
                loadData(1, search, e.target.value, statusFilter);
              }}
              className="px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
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
              className="px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
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
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs font-semibold shadow-2xs transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-2xs overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[92vh] my-4 bg-white rounded-xl border border-slate-200 shadow-2xl flex flex-col text-xs animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Enter product specifications, images, pricing, and features.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                aria-label="Close modal"
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
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {formError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

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
              <form id="product-form" onSubmit={handleSaveProduct} className="space-y-4">
                {/* ── 1. General Information ── */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Tellicherry Black Pepper TGSEB"
                        className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Product Badge
                      </label>
                      <input
                        type="text"
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        placeholder="e.g. Bestseller, 100% Pure"
                        className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Category *
                      </label>
                      <select
                        required
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                      >
                        <option value="">Select a category...</option>
                        {categories.map((c) => (
                          <option key={c.id || c._id} value={c.id || c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
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
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Subtitle *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={500}
                        value={shortDesc}
                        onChange={(e) => setShortDesc(e.target.value)}
                        placeholder="e.g. Single-estate Malabar black pepper with bold pungent aroma"
                        className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                      />
                    </div>
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
                      className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                    />
                  </div>
                </div>

                {/* ── 2. Product Images (Front, Side & Back) ── */}
                <div className="bg-slate-50/70 rounded-lg border border-slate-200/80 p-3.5 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#0F5638]" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Product Images (Front, Side &amp; Back)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Front Image */}
                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold">
                        Front Image (Primary)
                      </label>
                      <input
                        type="text"
                        value={frontImage}
                        onChange={(e) => setFrontImage(e.target.value)}
                        placeholder="/images/... or https://"
                        className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                      />
                      {frontImage.trim() ? (
                        <div className="mt-1.5 h-16 rounded border border-slate-200 bg-white overflow-hidden relative flex items-center justify-center">
                          <Image
                            src={frontImage}
                            alt="Front preview"
                            fill
                            className="object-contain p-1"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="mt-1.5 h-16 rounded border border-dashed border-slate-200 bg-slate-100/60 flex items-center justify-center text-slate-400 text-[10px]">
                          Front preview
                        </div>
                      )}
                    </div>

                    {/* Side Image */}
                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold">
                        Side Image
                      </label>
                      <input
                        type="text"
                        value={sideImage}
                        onChange={(e) => setSideImage(e.target.value)}
                        placeholder="/images/... or https://"
                        className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                      />
                      {sideImage.trim() ? (
                        <div className="mt-1.5 h-16 rounded border border-slate-200 bg-white overflow-hidden relative flex items-center justify-center">
                          <Image
                            src={sideImage}
                            alt="Side preview"
                            fill
                            className="object-contain p-1"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="mt-1.5 h-16 rounded border border-dashed border-slate-200 bg-slate-100/60 flex items-center justify-center text-slate-400 text-[10px]">
                          Side preview
                        </div>
                      )}
                    </div>

                    {/* Back Image */}
                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold">
                        Back Image
                      </label>
                      <input
                        type="text"
                        value={backImage}
                        onChange={(e) => setBackImage(e.target.value)}
                        placeholder="/images/... or https://"
                        className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                      />
                      {backImage.trim() ? (
                        <div className="mt-1.5 h-16 rounded border border-slate-200 bg-white overflow-hidden relative flex items-center justify-center">
                          <Image
                            src={backImage}
                            alt="Back preview"
                            fill
                            className="object-contain p-1"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="mt-1.5 h-16 rounded border border-dashed border-slate-200 bg-slate-100/60 flex items-center justify-center text-slate-400 text-[10px]">
                          Back preview
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── 3. Pricing & Pack Sizes (Reference Content in Yumnest Design) ── */}
                <div className="bg-emerald-50/20 rounded-xl border border-emerald-100/90 p-4 space-y-3.5 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#0F5638] text-white flex items-center justify-center">
                      <Tag className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-slate-900 text-sm">
                      Pricing &amp; Pack Sizes
                    </span>
                  </div>

                  {/* Regular Price, Offer Price, Discount (%) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold text-xs">
                        Regular Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={regularPrice || ''}
                        onChange={(e) => setRegularPrice(Number(e.target.value))}
                        placeholder="0.00"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold text-xs">
                        Offer Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={offerPrice || ''}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setOfferPrice(val);
                          if (packSizes.length === 1) {
                            setPackSizes([{ ...packSizes[0], price: val }]);
                          }
                        }}
                        placeholder="0.00"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold text-xs">
                        Discount (%)
                      </label>
                      <div className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-between">
                        <span>{discountPercent}%</span>
                        {discountPercent > 0 && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded border border-emerald-200/60">
                            SAVE ₹{regularPrice - offerPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pack Sizes Sub-section */}
                  <div className="pt-2.5 border-t border-emerald-100/90">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800 text-xs">Pack Sizes</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingPack(true);
                          setNewSize('');
                          setNewPrice(offerPrice);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs font-semibold transition shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Pack Size</span>
                      </button>
                    </div>

                    {/* Pack Sizes Table */}
                    <div className="overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-2xs">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold text-[11px]">
                          <tr>
                            <th className="py-2.5 px-3">Pack Size</th>
                            <th className="py-2.5 px-3">Price (₹)</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800">
                          {packSizes.map((pack, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/60 transition">
                              {editingPackIndex === idx ? (
                                <>
                                  <td className="py-1.5 px-3">
                                    <input
                                      type="text"
                                      value={editSize}
                                      onChange={(e) => setEditSize(e.target.value)}
                                      className="w-full px-2 py-1 rounded border border-slate-300 bg-white text-xs"
                                      autoFocus
                                    />
                                  </td>
                                  <td className="py-1.5 px-3">
                                    <input
                                      type="number"
                                      value={editPrice}
                                      onChange={(e) => setEditPrice(Number(e.target.value))}
                                      className="w-24 px-2 py-1 rounded border border-slate-300 bg-white text-xs"
                                    />
                                  </td>
                                  <td className="py-1.5 px-3 text-right space-x-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleSavePackEdit(idx)}
                                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold"
                                    >
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingPackIndex(null)}
                                      className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 text-[11px]"
                                    >
                                      Cancel
                                    </button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="py-2.5 px-3 font-semibold text-slate-900">{pack.size}</td>
                                  <td className="py-2.5 px-3 font-bold text-slate-900">₹{pack.price}</td>
                                  <td className="py-2.5 px-3 text-right">
                                    <div className="inline-flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => startEditPack(idx)}
                                        className="w-6 h-6 rounded bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center transition shadow-2xs"
                                        title="Edit pack size"
                                        aria-label="Edit pack size"
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeletePack(idx)}
                                        className="w-6 h-6 rounded bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition shadow-2xs"
                                        title="Delete pack size"
                                        aria-label="Delete pack size"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}

                          {/* Inline Add Row */}
                          {isAddingPack && (
                            <tr className="bg-emerald-50/50 border-t border-emerald-200">
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  placeholder="e.g. 250g / 500g / 1kg"
                                  value={newSize}
                                  onChange={(e) => setNewSize(e.target.value)}
                                  className="w-full px-2.5 py-1 rounded border border-emerald-300 bg-white text-xs"
                                  autoFocus
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  placeholder="Price (₹)"
                                  value={newPrice || ''}
                                  onChange={(e) => setNewPrice(Number(e.target.value))}
                                  className="w-28 px-2.5 py-1 rounded border border-emerald-300 bg-white text-xs"
                                />
                              </td>
                              <td className="py-2 px-3 text-right space-x-1.5">
                                <button
                                  type="button"
                                  onClick={handleAddPackSize}
                                  className="px-2.5 py-1 rounded bg-[#0F5638] hover:bg-[#187A4F] text-white text-[11px] font-semibold"
                                >
                                  Add
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsAddingPack(false)}
                                  className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 text-[11px]"
                                >
                                  Cancel
                                </button>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* ── 4. Stock Management (Reference Content in Yumnest Design) ── */}
                <div className="bg-emerald-50/20 rounded-xl border border-emerald-100/90 p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#0F5638] text-white flex items-center justify-center">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-slate-900 text-sm">
                      Stock Management
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Stock Status */}
                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold text-xs">
                        Stock Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={stockStatus}
                        onChange={(e) => setStockStatus(e.target.value as 'in_stock' | 'out_of_stock')}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                      >
                        <option value="in_stock">🟢 In Stock</option>
                        <option value="out_of_stock">🔴 Out of Stock</option>
                      </select>
                    </div>

                    {/* Available Stock */}
                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold text-xs">
                        Available Stock
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={stock}
                        onChange={(e) => setStock(Number(e.target.value))}
                        placeholder="e.g. 100"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                      />
                    </div>

                    {/* SKU */}
                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold text-xs">
                        SKU <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="e.g. YN-PEP-100"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs uppercase bg-white font-medium focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                      />
                    </div>
                  </div>
                </div>

                {/* ── 5. Product Features & Story ── */}
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Product Features
                    </label>
                    <input
                      type="text"
                      value={features}
                      onChange={(e) => setFeatures(e.target.value)}
                      placeholder="e.g. 100% Pure, Preservative Free, Single Estate, Handpicked (comma-separated)"
                      className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Separate multiple features with commas to display as highlights.
                    </span>
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
                    <label className="block font-semibold text-slate-700 mb-1">
                      Full Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="Detailed product story, origin, and culinary guidance..."
                      className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                    />
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
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-3.5 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="product-form"
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#0F5638] hover:bg-[#187A4F] text-white font-semibold shadow-2xs transition disabled:opacity-50"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{editingProduct ? 'Update Product' : 'Save Product'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
