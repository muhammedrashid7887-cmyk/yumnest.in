'use client';

import React, { useState, useTransition } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Tags,
  Sparkles,
} from 'lucide-react';
import { AdminTableRowSkeleton, Skeleton } from '@/components/ui/Skeleton';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/api/categories';
import type { CategoryItem, CategoryInput } from '@/types/api';
import { ApiRequestError } from '@/types/api';
import { SeoEditor, type SeoFormState } from '@/components/admin/SeoEditor';
import { useAdminSocket, useSocketEvent } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/lib/socket/events';

interface CategoryManagerProps {
  initialCategories: CategoryItem[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formMalayalamName, setFormMalayalamName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formOrder, setFormOrder] = useState<number>(0);
  const [formActive, setFormActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Category SEO State
  const [seoState, setSeoState] = useState<SeoFormState>({
    seoTitle: '',
    seoDescription: '',
    focusKeyword: '',
    secondaryKeywords: [],
    canonicalUrl: '',
    isNoIndex: false,
  });

  // Notification Banner
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async (query = '') => {
    setIsLoading(true);
    try {
      const res = await fetchCategories({ search: query });
      setCategories(res.data);
    } catch (err) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to load categories',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(search);
  };

  useAdminSocket();

  useSocketEvent(SOCKET_EVENTS.CATEGORY_CREATED, () => {
    loadData(search);
  });

  useSocketEvent(SOCKET_EVENTS.CATEGORY_UPDATED, () => {
    loadData(search);
  });

  useSocketEvent(SOCKET_EVENTS.CATEGORY_DELETED, () => {
    loadData(search);
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormMalayalamName('');
    setFormSlug('');
    setFormDesc('');
    setFormOrder(categories.length + 1);
    setFormActive(true);
    setSeoState({
      seoTitle: '',
      seoDescription: '',
      focusKeyword: '',
      secondaryKeywords: [],
      canonicalUrl: '',
      isNoIndex: false,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormMalayalamName(cat.malayalamName || '');
    setFormSlug(cat.slug);
    setFormDesc(cat.description || '');
    setFormOrder(cat.displayOrder ?? 0);
    setFormActive(cat.isActive);
    setSeoState({
      seoTitle: cat.seoTitle || '',
      seoDescription: cat.seoDescription || '',
      focusKeyword: cat.focusKeyword || '',
      secondaryKeywords: cat.secondaryKeywords || [],
      canonicalUrl: cat.canonicalUrl || '',
      isNoIndex: cat.isNoIndex ?? false,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleGenerateSlug = () => {
    if (!formName.trim()) return;
    const generated = formName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormSlug(generated);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formName.trim();
    if (!trimmedName) {
      setFormError('Category name is required.');
      return;
    }

    setFormError(null);

    startTransition(async () => {
      try {
        const payload: CategoryInput = {
          name: trimmedName,
          malayalamName: formMalayalamName.trim() || undefined,
          slug: formSlug.trim() || undefined,
          description: formDesc.trim() || undefined,
          displayOrder: Number(formOrder) || 0,
          isActive: formActive,
          seoTitle: seoState.seoTitle?.trim() || undefined,
          seoDescription: seoState.seoDescription?.trim() || undefined,
          focusKeyword: seoState.focusKeyword?.trim() || undefined,
          secondaryKeywords: seoState.secondaryKeywords?.length ? seoState.secondaryKeywords : undefined,
          canonicalUrl: seoState.canonicalUrl?.trim() || undefined,
          isNoIndex: Boolean(seoState.isNoIndex),
        };

        const categoryId = editingCategory?.id || editingCategory?._id;

        if (categoryId) {
          const updated = await updateCategory(categoryId, payload);
          setCategories((prev) =>
            prev.map((c) => ((c.id || c._id) === categoryId ? updated : c))
          );
          setNotice({ type: 'success', message: `Category "${updated.name}" updated successfully.` });
        } else {
          const created = await createCategory(payload);
          setCategories((prev) => [...prev, created]);
          setNotice({ type: 'success', message: `Category "${created.name}" created successfully.` });
        }

        setModalOpen(false);
      } catch (err) {
        if (err instanceof ApiRequestError) {
          setFormError(err.message);
        } else {
          setFormError('An unexpected error occurred while saving.');
        }
      }
    });
  };

  const handleDeleteCategory = (cat: CategoryItem) => {
    const categoryId = cat.id || cat._id;
    if (!categoryId) return;

    if (!confirm(`Are you sure you want to delete "${cat.name}"? If any products are assigned to this category, deletion will be blocked.`)) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteCategory(categoryId);
        setCategories((prev) => prev.filter((c) => (c.id || c._id) !== categoryId));
        setNotice({ type: 'success', message: `Category "${cat.name}" was deleted.` });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Could not delete category.';
        setNotice({ type: 'error', message: msg });
      }
    });
  };

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

      {/* ── Action & Filter Bar ───────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-8 pr-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
          />
        </form>

        <button
          type="button"
          onClick={openCreateModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add category</span>
        </button>
      </div>

      {/* ── Categories Table & Mobile Cards ─────────────────────────── */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div>
            {/* Mobile skeleton */}
            <div className="block md:hidden p-3 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-3.5 space-y-2.5 animate-pulse">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32 bg-slate-200 rounded" />
                    <Skeleton className="h-4 w-16 bg-slate-200 rounded" />
                  </div>
                  <Skeleton className="h-3 w-20 bg-slate-100 rounded" />
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <Skeleton className="h-4 w-16 bg-slate-100 rounded" />
                    <Skeleton className="h-6 w-16 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop skeleton */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4">Name</th>
                    <th className="py-2.5 px-3">Malayalam</th>
                    <th className="py-2.5 px-3">Slug</th>
                    <th className="py-2.5 px-3">Products</th>
                    <th className="py-2.5 px-3">Order</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4].map((i) => (
                    <AdminTableRowSkeleton key={i} columns={7} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
              <Tags className="w-4 h-4" />
            </div>
            <p className="font-semibold text-slate-700">No categories found</p>
            <p className="text-slate-400">Click &ldquo;Add category&rdquo; to create your first taxonomy.</p>
          </div>
        ) : (
          <div>
            {/* Mobile Card List (Screen < 768px) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {categories.map((cat) => {
                const catId = cat.id || cat._id;
                const pCount = cat.productCount ?? 0;
                return (
                  <div key={catId} className="p-3.5 space-y-2 hover:bg-slate-50/60 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-xs">
                          {cat.name}
                        </h4>
                        {cat.malayalamName && (
                          <p className="text-[11px] font-malayalam text-slate-500">
                            {cat.malayalamName}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 font-mono">
                          /{cat.slug}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          cat.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {cat.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {cat.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                          {pCount} {pCount === 1 ? 'product' : 'products'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Order: {cat.displayOrder ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(cat)}
                          className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-medium transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1 rounded-md border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
                    <th className="py-2.5 px-4">Name</th>
                    <th className="py-2.5 px-3">Malayalam</th>
                    <th className="py-2.5 px-3">Slug</th>
                    <th className="py-2.5 px-3">Products</th>
                    <th className="py-2.5 px-3">Order</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {categories.map((cat) => {
                    const catId = cat.id || cat._id;
                    const pCount = cat.productCount ?? 0;
                    return (
                      <tr key={catId} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-4">
                          <span className="font-semibold text-slate-900">{cat.name}</span>
                          {cat.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {cat.description}
                            </p>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-malayalam text-slate-700 text-[11px]">
                          {cat.malayalamName || '—'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                          /{cat.slug}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              pCount > 0
                                ? 'bg-slate-100 text-slate-800'
                                : 'bg-slate-50 text-slate-400 border border-slate-100'
                            }`}
                          >
                            {pCount} {pCount === 1 ? 'item' : 'items'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-medium">
                          {cat.displayOrder ?? 0}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                              cat.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {cat.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(cat)}
                            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                            title="Edit category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Delete category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Category Create/Edit Modal ─────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-xl p-5 text-xs space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">
                {editingCategory ? 'Edit Category' : 'New Category'}
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
              <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Masala Powders"
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Malayalam Name (മലയാളം)
                </label>
                <input
                  type="text"
                  value={formMalayalamName}
                  onChange={(e) => setFormMalayalamName(e.target.value)}
                  placeholder="e.g. മസാല പൊടികൾ"
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 font-malayalam focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Slug (optional)
                  </label>
                  {formName.trim() && (
                    <button
                      type="button"
                      onClick={handleGenerateSlug}
                      className="inline-flex items-center gap-1 text-[10px] text-[#0F5638] hover:underline cursor-pointer"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Generate from name</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="e.g. masala-powders (auto-generated if empty)"
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Brief description for category..."
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer py-1.5">
                    <input
                      type="checkbox"
                      checked={formActive}
                      onChange={(e) => setFormActive(e.target.checked)}
                      className="rounded border-slate-300 text-[#0F5638] focus:ring-[#0F5638]"
                    />
                    <span className="font-semibold text-slate-700">Active</span>
                  </label>
                </div>
              </div>

              {/* ── Category SEO & Search Engine Preview ── */}
              <SeoEditor
                entityType="category"
                defaultName={formName}
                defaultDescription={formDesc}
                slug={formSlug}
                onSlugChange={setFormSlug}
                seoData={seoState}
                onChange={(patch) => setSeoState((prev) => ({ ...prev, ...patch }))}
                existingItems={categories.map((c) => ({
                  id: c.id || c._id,
                  name: c.name,
                  slug: c.slug,
                  seoTitle: c.seoTitle,
                  seoDescription: c.seoDescription,
                }))}
                currentId={editingCategory?.id || editingCategory?._id}
              />

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
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#0F5638] hover:bg-[#187A4F] text-white font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCategory ? 'Update' : 'Create'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
