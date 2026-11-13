'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
  Upload,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  archiveProduct,
  restoreProduct,
  deleteProduct,
  updateProductStatus,
  uploadProductImage,
} from '@/lib/api/products';
import { AdminTableRowSkeleton, Skeleton } from '@/components/ui/Skeleton';
import type { AdminProduct, CategoryItem, ProductInput, ProductUpdateInput } from '@/types/api';
import { ApiRequestError } from '@/types/api';
import { useAdminSocket, useSocketEvent } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/lib/socket/events';

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
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [currentTab, setCurrentTab] = useState<'active' | 'archived'>('active');
  const [orderConflictProduct, setOrderConflictProduct] = useState<{
    product: AdminProduct;
    message: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Keep state synchronized with server props when route revalidates on active tab
  useEffect(() => {
    if (currentTab === 'active') {
      setProducts(initialProducts);
      setTotal(initialTotal);
    }
  }, [initialProducts, initialTotal, currentTab]);

  // Create Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [malayalamName, setMalayalamName] = useState('');
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
  const [packSizes, setPackSizes] = useState<Array<{ id?: string; size: string; price: number; sku?: string; stockQuantity?: number }>>([
    { size: '100g', price: 175, stockQuantity: 100 },
  ]);
  const [editingPackIndex, setEditingPackIndex] = useState<number | null>(null);
  const [editSize, setEditSize] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(100);
  const [isAddingPack, setIsAddingPack] = useState(false);
  const [newSize, setNewSize] = useState('');
  const [newPrice, setNewPrice] = useState<number>(0);
  const [newStock, setNewStock] = useState<number>(100);

  // Stock Management State
  const [stockStatus, setStockStatus] = useState<'in_stock' | 'out_of_stock'>('in_stock');
  const [stock, setStock] = useState<number>(100);
  const [sku, setSku] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [uploadingTarget, setUploadingTarget] = useState<'front' | 'side' | 'back' | null>(null);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'front' | 'side' | 'back'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingTarget(target);
      const fd = new FormData();
      fd.append('image', file);
      const res = await uploadProductImage(fd);
      const url = res.secureUrl || res.url;
      if (target === 'front') setFrontImage(url);
      else if (target === 'side') setSideImage(url);
      else if (target === 'back') setBackImage(url);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploadingTarget(null);
    }
  };

  // Live Discount Percentage Calculation
  const discountPercent =
    regularPrice > 0 && offerPrice >= 0 && regularPrice > offerPrice
      ? Math.round(((regularPrice - offerPrice) / regularPrice) * 100)
      : 0;

  // Notice Banner
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async (
    newPage = page,
    querySearch = search,
    cat = selectedCat,
    stat = statusFilter,
    isArchived = currentTab === 'archived'
  ) => {
    setIsLoading(true);
    try {
      const activeParam = stat === 'all' ? undefined : stat === 'true';
      const res = await fetchProducts({
        page: newPage,
        limit: 10,
        search: querySearch.trim() || undefined,
        category: cat || undefined,
        isActive: activeParam,
        isArchived: isArchived,
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
    loadData(1, search, selectedCat, statusFilter, currentTab === 'archived');
  };

  useAdminSocket();

  useSocketEvent(SOCKET_EVENTS.PRODUCT_CREATED, () => {
    loadData(page, search, selectedCat, statusFilter, currentTab === 'archived');
  });

  useSocketEvent(SOCKET_EVENTS.PRODUCT_UPDATED, () => {
    loadData(page, search, selectedCat, statusFilter, currentTab === 'archived');
  });

  useSocketEvent(SOCKET_EVENTS.PRODUCT_DELETED, () => {
    loadData(page, search, selectedCat, statusFilter, currentTab === 'archived');
  });

  useSocketEvent(SOCKET_EVENTS.PRODUCT_STOCK_UPDATED, () => {
    loadData(page, search, selectedCat, statusFilter, currentTab === 'archived');
  });

  const handleAddPackSize = () => {
    if (!newSize.trim()) return;
    const p = Number(newPrice) > 0 ? Number(newPrice) : offerPrice;
    const s = Math.max(0, Number(newStock) || 0);
    const updated = [...packSizes, { size: newSize.trim(), price: p, stockQuantity: s }];
    setPackSizes(updated);
    const total = updated.reduce((sum, item) => sum + (item.stockQuantity || 0), 0);
    setStock(total);
    setStockStatus(total > 0 ? 'in_stock' : 'out_of_stock');
    setNewSize('');
    setNewPrice(0);
    setNewStock(10);
    setIsAddingPack(false);
  };

  const startEditPack = (index: number) => {
    setEditingPackIndex(index);
    setEditSize(packSizes[index].size);
    setEditPrice(packSizes[index].price);
    setEditStock(packSizes[index].stockQuantity ?? 10);
  };

  const handleSavePackEdit = (index: number) => {
    if (!editSize.trim()) return;
    const updated = [...packSizes];
    updated[index] = {
      ...updated[index],
      size: editSize.trim(),
      price: Number(editPrice),
      stockQuantity: Math.max(0, Number(editStock) || 0),
    };
    setPackSizes(updated);
    const total = updated.reduce((sum, item) => sum + (item.stockQuantity || 0), 0);
    setStock(total);
    setStockStatus(total > 0 ? 'in_stock' : 'out_of_stock');
    setEditingPackIndex(null);
  };

  const handleDirectPackStockChange = (index: number, newQty: number) => {
    const updated = [...packSizes];
    updated[index] = {
      ...updated[index],
      stockQuantity: Math.max(0, newQty),
    };
    setPackSizes(updated);
    const total = updated.reduce((sum, item) => sum + (item.stockQuantity || 0), 0);
    setStock(total);
    setStockStatus(total > 0 ? 'in_stock' : 'out_of_stock');
  };

  const handleDeletePack = (index: number) => {
    if (packSizes.length <= 1) {
      alert('At least one pack size is required.');
      return;
    }
    const updated = packSizes.filter((_, i) => i !== index);
    setPackSizes(updated);
    const total = updated.reduce((sum, item) => sum + (item.stockQuantity || 0), 0);
    setStock(total);
    setStockStatus(total > 0 ? 'in_stock' : 'out_of_stock');
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setMalayalamName('');
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
    setPackSizes([{ size: '100g', price: 175, stockQuantity: 10 }]);
    setStockStatus('in_stock');
    setStock(10);
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
          stockQuantity: Math.max(0, Number(v.stockQuantity) || 0),
        }))
      );
    } else {
      setPackSizes([{ size: '100g', price: basePrice, stockQuantity: 0 }]);
    }

    const totalStock = p.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) ?? 0;
    setStock(totalStock);
    setStockStatus(totalStock > 0 ? 'in_stock' : 'out_of_stock');
    setSku(firstVariant?.sku || `YN-${Date.now().toString().slice(-5)}`);

    // Badge and features
    setBadge(p.badge || '');
    setFeatures((p.tags || []).join(', '));

    // Extract Front, Side, Back images
    setFrontImage(p.images?.[0]?.url || p.primaryImage || '');
    setSideImage(p.images?.[1]?.url || '');
    setBackImage(p.images?.[2]?.url || '');

    setIsAddingPack(false);
    setEditingPackIndex(null);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setFormError('Product name is required.');
    if (!shortDesc.trim()) return setFormError('Subtitle is required.');
    if (!desc.trim()) return setFormError('Full description is required.');
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

    // Build features list
    const featureList = features
      .split(/[\n,]/)
      .map((f) => f.trim())
      .filter(Boolean);

    const baseSku = sku.trim().toUpperCase() || `YN-${Date.now().toString().slice(-5)}`;
    const effectiveIsActive = editingProduct ? (editingProduct.isActive ?? true) : true;
    const targetStock = stockStatus === 'out_of_stock' ? 0 : Math.max(0, Number(stock) || 0);

    // Build variants from packSizes
    const builtVariants = packSizes.map((ps, idx) => ({
      id: ps.id,
      variantName: ps.size.trim() || 'Standard Pack',
      sku: ps.sku || (idx === 0 ? baseSku : `${baseSku}-${ps.size.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || idx + 1}`),
      price: Number(ps.price),
      compareAtPrice: regularPrice > ps.price ? Number(regularPrice) : undefined,
      stockQuantity: stockStatus === 'out_of_stock' ? 0 : (ps.stockQuantity !== undefined ? ps.stockQuantity : targetStock),
      unit: ps.size.replace(/[0-9.]/g, '').trim() || 'g',
      isActive: true,
    }));

    startTransition(async () => {
      try {
        if (editingProduct) {
          const updatePayload: ProductUpdateInput = {
            name: name.trim(),
            malayalamName: malayalamName.trim() || undefined,
            slug: slug.trim() || undefined,
            shortDescription: shortDesc.trim(),
            description: desc.trim(),
            category: categoryId.trim() || undefined,
            images: builtImages.length > 0 ? builtImages : undefined,
            variants: builtVariants,
            tags: featureList,
            badge: badge.trim(),
            isActive: effectiveIsActive,
            isFeatured: editingProduct.isFeatured ?? false,
          };
          const updated = await updateProduct(editingProduct.id, updatePayload);
          setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
          setNotice({ type: 'success', message: `Product "${updated.name}" updated successfully.` });
        } else {
          const payload: ProductInput = {
            name: name.trim(),
            malayalamName: malayalamName.trim() || undefined,
            slug: slug.trim() || undefined,
            shortDescription: shortDesc.trim(),
            description: desc.trim(),
            category: categoryId.trim() || undefined,
            images: builtImages.length > 0 ? builtImages : undefined,
            variants: builtVariants,
            tags: featureList,
            badge: badge.trim() || undefined,
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


  const handleDeletePermanent = (product: AdminProduct) => {
    const targetId = product.id || (product as unknown as { _id?: string })._id;
    if (!targetId) return;

    if (
      !confirm(
        `Are you sure you want to permanently delete "${product.name}"?\n\nCaution: If any customer orders reference this product, permanent deletion will be prevented to protect order records, and you will be offered the option to archive it instead.`
      )
    ) {
      return;
    }

    if (deletingId) return;
    setDeletingId(targetId);

    startTransition(async () => {
      try {
        await deleteProduct(targetId, true);
        setProducts((prev) => prev.filter((p) => (p.id || (p as unknown as { _id?: string })._id) !== targetId));
        setTotal((prev) => Math.max(0, prev - 1));
        setNotice({ type: 'success', message: `Product "${product.name}" was permanently deleted.` });

        // Invalidate Next.js client router cache and refresh Server Component state
        router.refresh();

        // If this was the last product on a page > 1, navigate back
        const targetPage = products.length <= 1 && page > 1 ? page - 1 : page;
        if (products.length <= 1 && page > 1) {
          setPage(targetPage);
        }
        await loadData(targetPage, search, selectedCat, statusFilter, currentTab === 'archived');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Could not delete product.';
        if (errorMsg.includes('existing order') || errorMsg.includes('reference it') || errorMsg.includes('archive')) {
          setOrderConflictProduct({
            product,
            message: errorMsg,
          });
        } else {
          setNotice({
            type: 'error',
            message: errorMsg,
          });
        }
      } finally {
        setDeletingId(null);
      }
    });
  };

  const handleArchive = (product: AdminProduct) => {
    const targetId = product.id || (product as unknown as { _id?: string })._id;
    if (!targetId) return;

    if (
      !confirm(
        `Are you sure you want to archive "${product.name}"?\n\nThis will immediately remove it from your Active Products list and the customer storefront, while safely preserving historical order records. You can restore it anytime from the Archived Products tab.`
      )
    ) {
      return;
    }

    if (deletingId) return;
    setDeletingId(targetId);

    startTransition(async () => {
      try {
        await archiveProduct(targetId);
        // Remove from Active list immediately
        setProducts((prev) =>
          prev.filter((p) => (p.id || (p as unknown as { _id?: string })._id) !== targetId)
        );
        setTotal((prev) => Math.max(0, prev - 1));
        setNotice({
          type: 'success',
          message: `Product "${product.name}" was archived. It is now safely stored in the "Archived Products" tab.`,
        });
        setOrderConflictProduct(null);
        router.refresh();

        const targetPage = products.length <= 1 && page > 1 ? page - 1 : page;
        if (products.length <= 1 && page > 1) {
          setPage(targetPage);
        }
        await loadData(targetPage, search, selectedCat, statusFilter, false);
      } catch (err) {
        setNotice({
          type: 'error',
          message: err instanceof Error ? err.message : 'Could not archive product.',
        });
      } finally {
        setDeletingId(null);
      }
    });
  };

  const handleRestore = (product: AdminProduct) => {
    const targetId = product.id || (product as unknown as { _id?: string })._id;
    if (!targetId) return;

    if (
      !confirm(
        `Are you sure you want to restore "${product.name}"?\n\nThis will return the product to your Active Products list and make it available on the storefront.`
      )
    ) {
      return;
    }

    if (deletingId) return;
    setDeletingId(targetId);

    startTransition(async () => {
      try {
        await restoreProduct(targetId);
        // Remove from Archived list immediately
        setProducts((prev) =>
          prev.filter((p) => (p.id || (p as unknown as { _id?: string })._id) !== targetId)
        );
        setTotal((prev) => Math.max(0, prev - 1));
        setNotice({
          type: 'success',
          message: `Product "${product.name}" was successfully restored to Active Products.`,
        });
        router.refresh();

        const targetPage = products.length <= 1 && page > 1 ? page - 1 : page;
        if (products.length <= 1 && page > 1) {
          setPage(targetPage);
        }
        await loadData(targetPage, search, selectedCat, statusFilter, true);
      } catch (err) {
        setNotice({
          type: 'error',
          message: err instanceof Error ? err.message : 'Could not restore product.',
        });
      } finally {
        setDeletingId(null);
      }
    });
  };

  const handleToggleStatus = (product: AdminProduct) => {
    if (product.isArchived) {
      handleRestore(product);
      return;
    }
    startTransition(async () => {
      try {
        const nextActive = !product.isActive;
        await updateProductStatus(product.id, nextActive);
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, isActive: nextActive } : p))
        );
        setNotice({
          type: 'success',
          message: `Product "${product.name}" marked as ${nextActive ? 'Active' : 'Inactive'}.`,
        });
      } catch (err) {
        setNotice({
          type: 'error',
          message: err instanceof Error ? err.message : 'Could not toggle product status.',
        });
      }
    });
  };

  const totalPages = Math.ceil(total / 10) || 1;

  return (
    <div className="space-y-4">

      {/* ── View Tabs: Active Products vs Archived Products ────────────── */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCurrentTab('active');
              setPage(1);
              loadData(1, search, selectedCat, statusFilter, false);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              currentTab === 'active'
                ? 'bg-[#0F5638] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Active Products</span>
            {currentTab === 'active' && (
              <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono leading-none">
                {total}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentTab('archived');
              setPage(1);
              loadData(1, search, selectedCat, 'all', true);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              currentTab === 'archived'
                ? 'bg-amber-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archived Products</span>
            {currentTab === 'archived' && (
              <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono leading-none">
                {total}
              </span>
            )}
          </button>
        </div>

        {currentTab === 'active' && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add product</span>
          </button>
        )}
      </div>

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

      {/* ── Order Protection / Conflict Modal ──────────────────────────── */}
      {orderConflictProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative max-w-md w-full bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Order History Protection
                </h3>
                <p className="text-xs text-slate-500">
                  Cannot permanently delete referenced product
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900 leading-relaxed">
              <p className="font-bold text-amber-950">
                {orderConflictProduct.product.name}
              </p>
              <p>
                {orderConflictProduct.message}
              </p>
              <p className="text-amber-800 text-[11px] pt-1 border-t border-amber-200/60">
                Archiving immediately removes this product from your storefront and active product listings, while keeping all past customer invoices, receipts, and order histories completely intact.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setOrderConflictProduct(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const prod = orderConflictProduct.product;
                  setOrderConflictProduct(null);
                  handleArchive(prod);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive Product Instead</span>
              </button>
            </div>
          </div>
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
              placeholder={currentTab === 'active' ? "Search active products..." : "Search archived products..."}
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCat}
              onChange={(e) => {
                setSelectedCat(e.target.value);
                loadData(1, search, e.target.value, statusFilter, currentTab === 'archived');
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

            {currentTab === 'active' && (
              <select
                value={statusFilter}
                onChange={(e) => {
                  const val = e.target.value as 'all' | 'true' | 'false';
                  setStatusFilter(val);
                  loadData(1, search, selectedCat, val, false);
                }}
                className="px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
              >
                <option value="all">All Visibility</option>
                <option value="true">Storefront Visible</option>
                <option value="false">Hidden / Draft</option>
              </select>
            )}
          </div>
        </form>
      </div>

      {/* ── Products Table & Mobile Cards ────────────────────────────── */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div>
            {/* Mobile skeleton */}
            <div className="block md:hidden p-3 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-3.5 space-y-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-lg bg-slate-200" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-3/4 bg-slate-200 rounded" />
                      <Skeleton className="h-3 w-1/2 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <Skeleton className="h-5 w-20 bg-slate-100 rounded" />
                    <Skeleton className="h-5 w-16 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop skeleton */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4">Product</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">{currentTab === 'active' ? 'Stock' : 'Archived Date'}</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <AdminTableRowSkeleton key={i} columns={6} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
              <Package className="w-4 h-4" />
            </div>
            <p className="font-semibold text-slate-700">
              {currentTab === 'active' ? 'No active products match your filters' : 'No archived products found'}
            </p>
            <p className="text-slate-400">
              {currentTab === 'active'
                ? 'Try adjusting your search criteria or add a new spice product.'
                : 'Products you archive to protect past orders will appear here and can be restored anytime.'}
            </p>
          </div>
        ) : (
          <div>
            {/* Mobile Card List (Screen < 768px) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {products.map((p) => {
                const catName =
                  typeof p.category === 'object' && p.category
                    ? p.category.name
                    : 'Unassigned';
                const baseVariant = p.variants?.[0];
                const totalStock = p.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) ?? 0;
                const primaryImg = p.primaryImage || p.images?.[0]?.url;
                const prodId = p.id || (p as unknown as { _id?: string })._id;

                return (
                  <div key={p.id} className="p-3.5 space-y-2.5 hover:bg-slate-50/60 transition">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden relative">
                        {primaryImg ? (
                          <Image src={primaryImg} alt={p.name} fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1.5">
                          <h4 className="font-semibold text-slate-900 text-xs truncate leading-snug">
                            {p.name}
                          </h4>
                          {currentTab === 'active' ? (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(p)}
                              className="flex-shrink-0 cursor-pointer"
                              title="Toggle status"
                            >
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                  p.isActive
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                }`}
                              >
                                {p.isActive ? 'Active' : 'Hidden'}
                              </span>
                            </button>
                          ) : (
                            <span className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/60">
                              Archived
                            </span>
                          )}
                        </div>
                        {p.malayalamName && (
                          <p className="text-[11px] font-malayalam text-slate-500 truncate">
                            {p.malayalamName}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          SKU: {baseVariant?.sku || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100/80">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium text-[10px]">
                          {catName}
                        </span>
                        <span className="font-bold text-slate-900">
                          ₹{baseVariant?.price ?? 0}
                        </span>
                      </div>
                      <div>
                        {currentTab === 'active' ? (
                          <span className={`font-semibold text-xs ${totalStock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                            {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">
                            {p.archivedAt ? new Date(p.archivedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Archived'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-1.5 pt-1.5">
                      {currentTab === 'active' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === prodId}
                            onClick={() => handleArchive(p)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-amber-50 text-slate-500 hover:text-amber-700 transition disabled:opacity-40"
                            title="Archive product"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === prodId}
                            onClick={() => handleDeletePermanent(p)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 transition disabled:opacity-40"
                            title="Delete product"
                          >
                            {deletingId === prodId ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            disabled={deletingId === prodId}
                            onClick={() => handleRestore(p)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200/60 transition disabled:opacity-40"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === prodId}
                            onClick={() => handleDeletePermanent(p)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 transition disabled:opacity-40"
                          >
                            {deletingId === prodId ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (Screen >= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4">Product</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">{currentTab === 'active' ? 'Stock' : 'Archived Date'}</th>
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
                    const prodId = p.id || (p as unknown as { _id?: string })._id;

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
                            {p.malayalamName && (
                              <p className="text-[11px] font-malayalam text-slate-500 truncate max-w-[220px]">
                                {p.malayalamName}
                              </p>
                            )}
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
                          {currentTab === 'active' ? (
                            <div className="flex flex-col">
                              <span className={`font-semibold text-xs ${totalStock > 0 ? 'text-slate-800' : 'text-red-600'}`}>
                                {totalStock} in stock
                              </span>
                              {p.variants && p.variants.length > 1 && (
                                <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                                  {p.variants.map((v) => `${v.variantName || 'Pack'}: ${v.stockQuantity ?? 0}`).join(' | ')}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 font-medium text-[11px]">
                              {p.archivedAt ? new Date(p.archivedAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              }) : 'Archived'}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {currentTab === 'active' ? (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(p)}
                              title="Click to toggle visibility"
                              className="cursor-pointer"
                            >
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                  p.isActive
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100'
                                    : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                                }`}
                              >
                                {p.isActive ? 'Active' : 'Hidden'}
                              </span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/60">
                              Archived
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right space-x-1.5 sm:space-x-2">
                          {currentTab === 'active' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => openEditModal(p)}
                                className="px-2 py-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={deletingId === prodId}
                                onClick={() => handleArchive(p)}
                                className="p-1 rounded text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition cursor-pointer disabled:opacity-40"
                                title="Archive product (safely keeps past orders)"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={deletingId === prodId}
                                onClick={() => handleDeletePermanent(p)}
                                className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer disabled:opacity-40"
                                title="Permanently delete product"
                              >
                                {deletingId === prodId ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                disabled={deletingId === prodId}
                                onClick={() => handleRestore(p)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200/60 transition cursor-pointer disabled:opacity-40"
                                title="Restore product to Active list & Storefront"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Restore</span>
                              </button>
                              <button
                                type="button"
                                disabled={deletingId === prodId}
                                onClick={() => handleDeletePermanent(p)}
                                className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer disabled:opacity-40"
                                title="Permanently delete product"
                              >
                                {deletingId === prodId ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {formError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

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
                        Category <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                      >
                        <option value="">No Category (Optional)</option>
                        {categories.map((c) => (
                          <option key={c.id || c._id} value={c.id || c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Malayalam Name (മലയാളം)
                      </label>
                      <input
                        type="text"
                        value={malayalamName}
                        onChange={(e) => setMalayalamName(e.target.value)}
                        placeholder="e.g. തലശ്ശേരി കുരുമുളക്"
                        className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-white font-malayalam focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
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
                        className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-white font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                      />
                    </div>
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
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-700 font-semibold">
                          Front Image (Primary)
                        </label>
                        <label className="text-[10px] text-emerald-700 hover:text-emerald-800 font-medium cursor-pointer flex items-center gap-1">
                          <Upload className="w-3 h-3" />
                          <span>{uploadingTarget === 'front' ? 'Uploading...' : 'Upload'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingTarget !== null}
                            onChange={(e) => handleImageUpload(e, 'front')}
                          />
                        </label>
                      </div>
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
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-700 font-semibold">
                          Side Image
                        </label>
                        <label className="text-[10px] text-emerald-700 hover:text-emerald-800 font-medium cursor-pointer flex items-center gap-1">
                          <Upload className="w-3 h-3" />
                          <span>{uploadingTarget === 'side' ? 'Uploading...' : 'Upload'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingTarget !== null}
                            onChange={(e) => handleImageUpload(e, 'side')}
                          />
                        </label>
                      </div>
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
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-700 font-semibold">
                          Back Image
                        </label>
                        <label className="text-[10px] text-emerald-700 hover:text-emerald-800 font-medium cursor-pointer flex items-center gap-1">
                          <Upload className="w-3 h-3" />
                          <span>{uploadingTarget === 'back' ? 'Uploading...' : 'Upload'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingTarget !== null}
                            onChange={(e) => handleImageUpload(e, 'back')}
                          />
                        </label>
                      </div>
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
                            <th className="py-2.5 px-3">Stock</th>
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
                                      className="w-20 px-2 py-1 rounded border border-slate-300 bg-white text-xs"
                                    />
                                  </td>
                                  <td className="py-1.5 px-3">
                                    <input
                                      type="number"
                                      min="0"
                                      value={editStock}
                                      onChange={(e) => setEditStock(Math.max(0, Number(e.target.value)))}
                                      className="w-20 px-2 py-1 rounded border border-slate-300 bg-white text-xs font-semibold"
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
                                  <td className="py-2 px-3">
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="number"
                                        min="0"
                                        value={pack.stockQuantity ?? 0}
                                        onChange={(e) => handleDirectPackStockChange(idx, parseInt(e.target.value) || 0)}
                                        className="w-16 px-2 py-1 rounded border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                                        aria-label={`Stock for ${pack.size}`}
                                      />
                                      <span className="text-[10px] text-slate-400">units</span>
                                    </div>
                                  </td>
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
                                  className="w-20 px-2.5 py-1 rounded border border-emerald-300 bg-white text-xs"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  placeholder="Stock"
                                  min="0"
                                  value={newStock}
                                  onChange={(e) => setNewStock(Math.max(0, Number(e.target.value)))}
                                  className="w-20 px-2.5 py-1 rounded border border-emerald-300 bg-white text-xs font-semibold"
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
                        onChange={(e) => {
                          const val = e.target.value as 'in_stock' | 'out_of_stock';
                          setStockStatus(val);
                          if (val === 'out_of_stock') {
                            setStock(0);
                            setPackSizes((prev) => prev.map((p) => ({ ...p, stockQuantity: 0 })));
                          } else if (stock === 0) {
                            setStock(50);
                            setPackSizes((prev) => prev.map((p) => ({ ...p, stockQuantity: p.stockQuantity || 50 })));
                          }
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                      >
                        <option value="in_stock">🟢 In Stock</option>
                        <option value="out_of_stock">🔴 Out of Stock</option>
                      </select>
                    </div>

                    {/* Available Stock */}
                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold text-xs">
                        {packSizes.length > 1 ? 'Total Available Stock' : 'Available Stock'}
                      </label>
                      {packSizes.length > 1 ? (
                        <div className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 flex items-center justify-between">
                          <span>{packSizes.reduce((s, p) => s + (p.stockQuantity || 0), 0)} units</span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            ({packSizes.map((p) => `${p.size}: ${p.stockQuantity || 0}`).join(' + ')})
                          </span>
                        </div>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          value={stock}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value) || 0);
                            setStock(val);
                            setStockStatus(val > 0 ? 'in_stock' : 'out_of_stock');
                            setPackSizes([{ ...packSizes[0], stockQuantity: val }]);
                          }}
                          placeholder="e.g. 10"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                        />
                      )}
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
