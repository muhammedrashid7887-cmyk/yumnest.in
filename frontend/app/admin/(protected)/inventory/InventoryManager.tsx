'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import Image from 'next/image';
import {
  Boxes,
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  History,
  Pencil,
  ArrowRight,
  X,
  Loader2,
  Plus,
  Minus,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Package,
} from 'lucide-react';
import {
  fetchInventory,
  fetchProductInventory,
  adjustInventoryStock,
  fetchStockHistory,
} from '@/lib/api/inventory';
import { fetchCategories } from '@/lib/api/categories';
import { useSocketEvent } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/lib/socket/events';
import type {
  InventoryItem,
  InventorySummary,
  StockHistoryItem,
  StockAdjustmentPayload,
  InventoryStockStatus,
} from '@/types/inventory';
import type { CategoryItem } from '@/types/api';

export default function InventoryManager() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary>({
    totalProducts: 0,
    inStockCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Edit Stock Modal State
  const [editProduct, setEditProduct] = useState<InventoryItem | null>(null);
  const [editVariantId, setEditVariantId] = useState<string>('');
  const [adjustMode, setAdjustMode] = useState<'add' | 'remove' | 'set'>('set');
  const [adjustQuantity, setAdjustQuantity] = useState<number>(100);
  const [adjustThreshold, setAdjustThreshold] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [savingStock, setSavingStock] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // History Modal State
  const [historyProduct, setHistoryProduct] = useState<InventoryItem | null>(null);
  const [historyLogs, setHistoryLogs] = useState<StockHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyMeta, setHistoryMeta] = useState({ total: 0, pages: 1 });
  const [historyVariantFilter, setHistoryVariantFilter] = useState<string>('');

  const [isPending, startTransition] = useTransition();

  // Load Inventory Data
  const loadInventory = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      try {
        const res = await fetchInventory({
          page: currentPage,
          limit: 15,
          search: search.trim() || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          sortBy: 'updatedAt',
          sortOrder: 'desc',
        });
        setItems(res.items);
        setMeta(res.meta);
        setSummary(res.summary);
      } catch (err: any) {
        setError(err.message || 'Failed to load inventory data');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [currentPage, search, selectedCategory, selectedStatus]
  );

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // Load categories for filter
  useEffect(() => {
    fetchCategories()
      .then((res) => {
        if (res.data) setCategories(res.data);
      })
      .catch(() => {});
  }, []);

  // Real-time synchronization
  useSocketEvent(SOCKET_EVENTS.PRODUCT_STOCK_UPDATED, () => {
    loadInventory(true);
  });
  useSocketEvent(SOCKET_EVENTS.PRODUCT_CREATED, () => loadInventory(true));
  useSocketEvent(SOCKET_EVENTS.PRODUCT_UPDATED, () => loadInventory(true));
  useSocketEvent(SOCKET_EVENTS.PRODUCT_DELETED, () => loadInventory(true));
  useSocketEvent(SOCKET_EVENTS.ORDER_CREATED, () => loadInventory(true));
  useSocketEvent(SOCKET_EVENTS.ORDER_STATUS_UPDATED, () => loadInventory(true));

  // Reset page when search or filters change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  // Open Edit Stock Modal
  const openEditModal = (item: InventoryItem) => {
    setEditProduct(item);
    const firstVariant = item.variants[0];
    setEditVariantId(firstVariant?.id || '');
    setAdjustMode('set');
    setAdjustQuantity(firstVariant?.stockQuantity ?? item.totalStock);
    setAdjustThreshold(firstVariant?.lowStockThreshold ?? item.lowStockThreshold ?? 10);
    setAdjustReason('');
    setModalError(null);
  };

  // When selected variant changes in edit modal
  const handleVariantSelectChange = (variantId: string) => {
    setEditVariantId(variantId);
    if (editProduct) {
      const v = editProduct.variants.find((vr) => vr.id === variantId);
      if (v) {
        if (adjustMode === 'set') {
          setAdjustQuantity(v.stockQuantity);
        } else {
          setAdjustQuantity(0);
        }
        setAdjustThreshold(v.lowStockThreshold);
      }
    }
  };

  // Switch adjustment mode safely
  const switchAdjustMode = (newMode: 'add' | 'remove' | 'set') => {
    setAdjustMode(newMode);
    if (newMode === 'set') {
      setAdjustQuantity(currentStock);
    } else {
      // Avoid accidental doubling: adding or removing requires explicit delta
      setAdjustQuantity(0);
    }
  };

  // Calculate live preview stock
  const currentSelectedVariant = editProduct?.variants.find((v) => v.id === editVariantId) || editProduct?.variants[0];
  const currentStock = currentSelectedVariant?.stockQuantity ?? (editProduct?.totalStock || 0);

  let previewNewStock = currentStock;
  if (adjustMode === 'add') {
    previewNewStock = currentStock + (Number(adjustQuantity) || 0);
  } else if (adjustMode === 'remove') {
    previewNewStock = Math.max(0, currentStock - (Number(adjustQuantity) || 0));
  } else if (adjustMode === 'set') {
    previewNewStock = Math.max(0, Number(adjustQuantity) || 0);
  }

  const previewStatus: InventoryStockStatus =
    previewNewStock <= 0 ? 'out_of_stock' : previewNewStock <= adjustThreshold ? 'low_stock' : 'in_stock';

  // Save Stock Adjustment
  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;

    if (adjustMode === 'remove' && Number(adjustQuantity) > currentStock) {
      setModalError(`Cannot remove ${adjustQuantity} units. Current available stock is only ${currentStock}.`);
      return;
    }

    setSavingStock(true);
    setModalError(null);

    try {
      const payload: StockAdjustmentPayload = {
        variantId: editVariantId || undefined,
        mode: adjustMode,
        quantity: Math.max(0, Number(adjustQuantity)),
        lowStockThreshold: Math.max(0, Number(adjustThreshold)),
        reason: adjustReason.trim() || undefined,
      };

      const res = await adjustInventoryStock(editProduct.productId, payload);

      // Optimistically update local list
      setItems((prev) =>
        prev.map((item) => (item.productId === res.product.productId ? res.product : item))
      );

      setEditProduct(null);
      loadInventory(true);
    } catch (err: any) {
      setModalError(err.message || 'Failed to update stock');
    } finally {
      setSavingStock(false);
    }
  };

  // Open History Drawer / Modal
  const openHistoryModal = async (item: InventoryItem) => {
    setHistoryProduct(item);
    setHistoryPage(1);
    setHistoryVariantFilter('');
    setHistoryLoading(true);
    try {
      const res = await fetchStockHistory(item.productId, { page: 1, limit: 15 });
      setHistoryLogs(res.history);
      setHistoryMeta({ total: res.total, pages: res.pages });
    } catch {
      setHistoryLogs([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch paginated history
  const loadHistoryPage = async (page: number, variantId?: string) => {
    if (!historyProduct) return;
    setHistoryLoading(true);
    try {
      const res = await fetchStockHistory(historyProduct.productId, {
        page,
        limit: 15,
        variantId: variantId || undefined,
      });
      setHistoryLogs(res.history);
      setHistoryPage(res.page);
      setHistoryMeta({ total: res.total, pages: res.pages });
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0F6B47] text-white flex items-center justify-center shadow-xs">
              <Boxes className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Inventory & Stock Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time MongoDB stock control, low-stock alerts, and complete audit trail.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadInventory()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Products */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {summary.totalProducts}
            </span>
            <span className="text-xs text-slate-500">items listed</span>
          </div>
        </div>

        {/* In Stock */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">In Stock</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
              {summary.inStockCount}
            </span>
            <span className="text-xs text-emerald-700 font-medium">available</span>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Low Stock Alert</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-950">
              {summary.lowStockCount}
            </span>
            <span className="text-xs text-amber-700 font-medium">&le; threshold</span>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Out of Stock</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-950">
              {summary.outOfStockCount}
            </span>
            <span className="text-xs text-rose-700 font-medium">requires restock</span>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Product Name or SKU..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F6B47] transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-56">
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F6B47]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id || c._id} value={c.slug || c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stock Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          {[
            { id: 'all', label: 'All Items', count: summary.totalProducts },
            { id: 'in_stock', label: 'In Stock', count: summary.inStockCount, color: 'text-emerald-700' },
            { id: 'low_stock', label: 'Low Stock', count: summary.lowStockCount, color: 'text-amber-700' },
            { id: 'out_of_stock', label: 'Out of Stock', count: summary.outOfStockCount, color: 'text-rose-700' },
          ].map((tab) => {
            const active = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleStatusChange(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#0F6B47] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    active ? 'bg-white/25 text-white' : 'bg-white text-slate-700 shadow-2xs'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Inventory Data Table ── */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#0F6B47] animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading live inventory from MongoDB...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-bold text-slate-800">{error}</p>
            <button
              type="button"
              onClick={() => loadInventory()}
              className="px-4 py-2 rounded-xl bg-[#0F6B47] text-white text-xs font-semibold hover:bg-[#187A4F]"
            >
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Boxes className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800">No inventory matches found</p>
            <p className="text-xs text-slate-500">Try modifying your search or status filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Variants Stock</th>
                  <th className="py-3 px-3">Available</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Threshold</th>
                  <th className="py-3 px-3">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {items.map((item) => (
                  <tr key={item.productId} className="hover:bg-slate-50/80 transition">
                    {/* Product Name & Image */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          {item.primaryImage ? (
                            <img
                              src={item.primaryImage}
                              alt={item.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-xs sm:text-sm truncate max-w-[180px] sm:max-w-xs" title={item.name}>
                            {item.name}
                          </p>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ID: {item.productId.slice(-6)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-3 px-3 font-mono text-[11px] font-semibold text-slate-600 uppercase">
                      {item.sku || 'N/A'}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/80">
                        {item.category?.name || 'General'}
                      </span>
                    </td>

                    {/* Variants Breakdown */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {item.variants.map((v) => (
                          <span
                            key={v.id}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                              v.stockQuantity === 0
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : v.stockQuantity <= v.lowStockThreshold
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                            title={`${v.variantName}: ${v.stockQuantity} ${v.unit} in stock`}
                          >
                            <span>{v.variantName}:</span>
                            <span className="font-bold">{v.stockQuantity}</span>
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Available Stock */}
                    <td className="py-3 px-3">
                      <div className="flex items-baseline gap-1 font-bold text-sm">
                        <span
                          className={
                            item.totalStock === 0
                              ? 'text-rose-600'
                              : item.totalStock <= item.lowStockThreshold
                              ? 'text-amber-600'
                              : 'text-slate-900'
                          }
                        >
                          {item.totalStock}
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal">units</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3">
                      {item.stockStatus === 'in_stock' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>In Stock</span>
                        </span>
                      )}
                      {item.stockStatus === 'low_stock' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Low Stock</span>
                        </span>
                      )}
                      {item.stockStatus === 'out_of_stock' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Out of Stock</span>
                        </span>
                      )}
                    </td>

                    {/* Threshold */}
                    <td className="py-3 px-3 text-slate-500 font-medium">
                      &le; {item.lowStockThreshold} units
                    </td>

                    {/* Last Updated */}
                    <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(item.updatedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0F6B47] hover:bg-[#187A4F] text-white text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
                          title="Adjust stock quantity"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit Stock</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openHistoryModal(item)}
                          className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center transition shadow-2xs cursor-pointer"
                          title="View movement history"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {meta.pages > 1 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing page {meta.page} of {meta.pages} ({meta.total} products)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <button
                type="button"
                disabled={currentPage >= meta.pages}
                onClick={() => setCurrentPage((p) => Math.min(meta.pages, p + 1))}
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Stock Modal ── */}
      {editProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !savingStock && setEditProduct(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-5 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Adjust Product Stock</h3>
                <p className="text-xs text-slate-500 font-medium truncate max-w-sm">
                  {editProduct.name}
                </p>
              </div>
              <button
                type="button"
                disabled={savingStock}
                onClick={() => setEditProduct(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveStock} className="space-y-4">
              {/* Variant Selector (if multiple variants) */}
              {editProduct.variants.length > 1 && (
                <div>
                  <label className="block text-slate-700 mb-1 font-bold text-xs">
                    Select Variant
                  </label>
                  <select
                    value={editVariantId}
                    onChange={(e) => handleVariantSelectChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F6B47]"
                  >
                    {editProduct.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.variantName} (Current: {v.stockQuantity} in stock) — SKU: {v.sku}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Adjustment Mode Selector */}
              <div>
                <label className="block text-slate-700 mb-1 font-bold text-xs">
                  Adjustment Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => switchAdjustMode('add')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      adjustMode === 'add'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Stock</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => switchAdjustMode('remove')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      adjustMode === 'remove'
                        ? 'bg-amber-600 border-amber-600 text-white shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Reduce Stock</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => switchAdjustMode('set')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      adjustMode === 'set'
                        ? 'bg-[#0F6B47] border-[#0F6B47] text-white shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Set Exact</span>
                  </button>
                </div>
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-slate-700 mb-1 font-bold text-xs">
                  {adjustMode === 'add'
                    ? 'Units to Add (+)'
                    : adjustMode === 'remove'
                    ? 'Units to Deduct (-)'
                    : 'Exact Stock Quantity (=)'}
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#0F6B47]"
                  placeholder={
                    adjustMode === 'add'
                      ? 'e.g. 10 (units to add to stock)'
                      : adjustMode === 'remove'
                      ? 'e.g. 5 (units to deduct from stock)'
                      : 'e.g. 50 (exact stock count)'
                  }
                />
              </div>

              {/* Low-Stock Threshold */}
              <div>
                <label className="block text-slate-700 mb-1 font-bold text-xs">
                  Low-Stock Alert Threshold
                </label>
                <input
                  type="number"
                  min="0"
                  value={adjustThreshold}
                  onChange={(e) => setAdjustThreshold(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#0F6B47]"
                  placeholder="e.g. 10 (triggers low-stock alert when <= this number)"
                />
              </div>

              {/* Reason / Note */}
              <div>
                <label className="block text-slate-700 mb-1 font-bold text-xs">
                  Reason or Movement Note (Optional)
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Received new shipment from warehouse"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#0F6B47]"
                />
              </div>

              {/* Live Preview Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <span>Stock Calculation Preview</span>
                  <span className="font-semibold text-slate-600 normal-case">
                    Variant: <span className="text-slate-900 font-bold">{currentSelectedVariant?.variantName || 'Default'}</span>
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">Current: <b className="text-slate-900">{currentStock}</b></span>
                    {adjustMode === 'add' ? (
                      <>
                        <span className="text-emerald-600 font-black text-sm">+</span>
                        <span className="text-emerald-700 font-bold">Add: {adjustQuantity}</span>
                      </>
                    ) : adjustMode === 'remove' ? (
                      <>
                        <span className="text-rose-600 font-black text-sm">-</span>
                        <span className="text-rose-700 font-bold">Deduct: {adjustQuantity}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-slate-400 font-black text-sm">&rarr;</span>
                        <span className="text-[#0F6B47] font-bold">Set Exact: {adjustQuantity}</span>
                      </>
                    )}
                    <span className="text-slate-400 font-black">=</span>
                    <span className="text-sm font-black text-[#0F6B47]">{previewNewStock} units</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      previewStatus === 'in_stock'
                        ? 'bg-emerald-100 text-emerald-800'
                        : previewStatus === 'low_stock'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {previewStatus.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={savingStock}
                  onClick={() => setEditProduct(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStock}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0F6B47] hover:bg-[#187A4F] text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {savingStock ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to MongoDB...</span>
                    </>
                  ) : (
                    <span>Save Stock Adjustment</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Stock History Modal / Drawer ── */}
      {historyProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setHistoryProduct(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl p-6 shadow-2xl flex flex-col space-y-4 border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Stock Movement History
                  </h3>
                  <p className="text-xs text-slate-500 font-medium truncate max-w-md">
                    {historyProduct.name} &bull; Total Available: {historyProduct.totalStock} units
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHistoryProduct(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Variant Filter for History */}
            {historyProduct.variants.length > 1 && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-slate-600">Filter Variant:</span>
                <select
                  value={historyVariantFilter}
                  onChange={(e) => {
                    setHistoryVariantFilter(e.target.value);
                    loadHistoryPage(1, e.target.value);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium"
                >
                  <option value="">All Variants</option>
                  {historyProduct.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.variantName} ({v.sku})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* History Table */}
            <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200">
              {historyLoading ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-6 h-6 text-[#0F6B47] animate-spin" />
                  <p className="text-xs text-slate-500 font-medium">Loading history logs...</p>
                </div>
              ) : historyLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No stock adjustments recorded yet for this product.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Date & Time</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Variant</th>
                      <th className="py-2.5 px-3">Change</th>
                      <th className="py-2.5 px-3">Transition</th>
                      <th className="py-2.5 px-3">Reason / Note</th>
                      <th className="py-2.5 px-3">Operator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {historyLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 text-[11px]">
                          {new Date(log.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.operationType === 'stock_added'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.operationType === 'stock_removed'
                                ? 'bg-amber-100 text-amber-800'
                                : log.operationType === 'order_placed'
                                ? 'bg-sky-100 text-sky-800'
                                : log.operationType === 'order_cancelled'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {log.operationType.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-700">
                          {log.variantName || 'Standard'}
                        </td>
                        <td className="py-2.5 px-3 font-bold">
                          <span
                            className={
                              log.quantityChanged > 0
                                ? 'text-emerald-600'
                                : log.quantityChanged < 0
                                ? 'text-rose-600'
                                : 'text-slate-600'
                            }
                          >
                            {log.quantityChanged > 0 ? `+${log.quantityChanged}` : log.quantityChanged}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                          {log.previousStock} &rarr; {log.newStock}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-[160px] truncate" title={log.reason}>
                          {log.reason || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                          {log.performedBy}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* History Pagination */}
            {historyMeta.pages > 1 && (
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 shrink-0">
                <span>
                  Page {historyPage} of {historyMeta.pages}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={historyPage <= 1}
                    onClick={() => loadHistoryPage(historyPage - 1, historyVariantFilter)}
                    className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={historyPage >= historyMeta.pages}
                    onClick={() => loadHistoryPage(historyPage + 1, historyVariantFilter)}
                    className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
