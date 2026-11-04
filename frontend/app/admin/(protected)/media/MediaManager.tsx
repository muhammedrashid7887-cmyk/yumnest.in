'use client';

import React, { useState, useTransition, useMemo } from 'react';
import Image from 'next/image';
import {
  Plus,
  Search,
  Video,
  Play,
  Upload,
  Pencil,
  Trash2,
  Archive,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
  ArrowUpDown,
  Tag,
  Clock,
  Eye,
} from 'lucide-react';
import { YoutubeIcon, InstagramIcon } from '@/components/common/BrandMediaIcons';
import {
  fetchAdminMediaItems,
  createMediaItem,
  updateMediaItem,
  updateMediaItemStatus,
  deleteMediaItem,
  uploadMediaThumbnail,
  fetchMediaMetadata,
} from '@/lib/api/media';
import { getMediaLivePreview } from '@/lib/utils/media-url';
import type { AdminMediaItem, MediaPlatform, MediaStatus, MediaItemInput, MediaItemUpdateInput } from '@/types/api';
import { ApiRequestError } from '@/types/api';

interface MediaManagerProps {
  initialMedia: AdminMediaItem[];
  initialTotal: number;
}

const POPULAR_CATEGORIES = [
  'Broast Special',
  'Signature Rubs',
  'Heritage Recipes',
  'Seafood Specials',
  'Cooking Tips',
  'Vlogs & Stories',
];

export function MediaManager({ initialMedia, initialTotal }: MediaManagerProps) {
  const [items, setItems] = useState<AdminMediaItem[]>(initialMedia);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'youtube' | 'instagram'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Create / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminMediaItem | null>(null);

  // Form Fields
  const [platform, setPlatform] = useState<MediaPlatform>('youtube');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [titleMl, setTitleMl] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionMl, setDescriptionMl] = useState('');
  const [category, setCategory] = useState(POPULAR_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [status, setStatus] = useState<MediaStatus>('published');
  const [featured, setFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState<number>(1);

  // Thumbnail upload state
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [metaFetchedVia, setMetaFetchedVia] = useState<string | null>(null);

  // Video preview player modal state
  const [previewItem, setPreviewItem] = useState<AdminMediaItem | null>(null);

  // Notice banner
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Derived live preview from URL input
  const livePreview = useMemo(() => {
    return getMediaLivePreview(platform, url, thumbnailUrl);
  }, [platform, url, thumbnailUrl]);

  // Load Data from Server
  const loadData = async (
    newPage = page,
    querySearch = search,
    queryPlatform = platformFilter,
    queryStatus = statusFilter
  ) => {
    setIsLoading(true);
    try {
      const res = await fetchAdminMediaItems({
        page: newPage,
        limit: 20,
        search: querySearch || undefined,
        platform: queryPlatform,
        status: queryStatus,
      });
      setItems(res.data);
      if (res.meta) setTotal(res.meta.total);
      setPage(newPage);
    } catch (err) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to query media items.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(1, search, platformFilter, statusFilter);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setPlatform('youtube');
    setUrl('');
    setTitle('');
    setTitleMl('');
    setDescription('');
    setDescriptionMl('');
    setCategory(POPULAR_CATEGORIES[0]);
    setCustomCategory('');
    setThumbnailUrl('');
    setDuration('');
    setStatus('published');
    setFeatured(false);
    setDisplayOrder(items.length + 1);
    setMetaFetchedVia(null);
    setIsFetchingMeta(false);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (item: AdminMediaItem) => {
    setEditingItem(item);
    setPlatform(item.platform);
    setUrl(item.url);
    setTitle(item.title);
    setTitleMl(item.titleMl || '');
    setDescription(item.description);
    setDescriptionMl(item.descriptionMl || '');
    if (POPULAR_CATEGORIES.includes(item.category)) {
      setCategory(item.category);
      setCustomCategory('');
    } else {
      setCategory('Custom');
      setCustomCategory(item.category);
    }
    setThumbnailUrl(item.thumbnailUrl || '');
    setDuration(item.duration || '');
    setStatus(item.status);
    setFeatured(item.featured);
    setDisplayOrder(item.displayOrder);
    setFormError(null);
    setModalOpen(true);
  };


  // Automatic YouTube & Instagram Metadata Fetching
  const handleFetchMetadata = async (targetUrl = url, targetPlatform = platform) => {
    const raw = targetUrl.trim();
    if (!raw) return;
    try {
      setIsFetchingMeta(true);
      setFormError(null);
      const meta = await fetchMediaMetadata(targetPlatform, raw);

      if (meta.title && (!title.trim() || title === editingItem?.title)) {
        setTitle(meta.title);
      } else if (meta.title && !editingItem) {
        setTitle(meta.title);
      }

      if (meta.description && (!description.trim() || description === editingItem?.description)) {
        setDescription(meta.description);
      } else if (meta.description && !editingItem) {
        setDescription(meta.description);
      }

      if (meta.thumbnailUrl && (!thumbnailUrl.trim() || thumbnailUrl.includes('youtube.com') || thumbnailUrl.includes('instagram'))) {
        setThumbnailUrl(meta.thumbnailUrl);
      }

      if (meta.duration && (!duration.trim() || duration === editingItem?.duration)) {
        setDuration(meta.duration);
      }

      setMetaFetchedVia(meta.fetchedVia);
    } catch (err) {
      console.warn('Metadata fetch warning:', err);
    } finally {
      setIsFetchingMeta(false);
    }
  };

  // Thumbnail upload handler via Cloudinary
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size must be less than 5MB.');
      return;
    }

    try {
      setIsUploadingThumb(true);
      setFormError(null);
      const res = await uploadMediaThumbnail(file);
      setThumbnailUrl(res.secureUrl);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Thumbnail upload failed. Please verify Cloudinary credentials or provide an image URL.'
      );
    } finally {
      setIsUploadingThumb(false);
    }
  };

  // Form submit handler
  const handleSaveMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return setFormError('Media URL is required.');
    if (!title.trim()) return setFormError('Title is required.');
    if (!description.trim()) return setFormError('Description is required.');

    const finalCategory = (category === 'Custom' ? customCategory : category).trim();
    if (!finalCategory) return setFormError('Category is required.');

    if (!livePreview.isValid) {
      return setFormError(livePreview.error || `Please enter a valid ${platform === 'youtube' ? 'YouTube' : 'Instagram'} URL.`);
    }

    setFormError(null);

    const payload: MediaItemInput = {
      platform,
      url: url.trim(),
      title: title.trim(),
      titleMl: titleMl.trim() || undefined,
      description: description.trim(),
      descriptionMl: descriptionMl.trim() || undefined,
      category: finalCategory,
      thumbnailUrl: thumbnailUrl.trim() || livePreview.defaultThumbnailUrl || undefined,
      duration: duration.trim() || undefined,
      status,
      featured,
      displayOrder: Number(displayOrder) || 1,
    };

    startTransition(async () => {
      try {
        if (editingItem) {
          const updatePayload: MediaItemUpdateInput = { ...payload };
          const updated = await updateMediaItem(editingItem._id || editingItem.id!, updatePayload);
          setItems((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
          setNotice({ type: 'success', message: `Media "${updated.title}" updated successfully.` });
        } else {
          const created = await createMediaItem(payload);
          setItems((prev) => [created, ...prev]);
          setTotal((prev) => prev + 1);
          setNotice({ type: 'success', message: `Media "${created.title}" published successfully.` });
        }
        setModalOpen(false);
      } catch (err) {
        if (err instanceof ApiRequestError) {
          setFormError(err.message);
        } else {
          setFormError(err instanceof Error ? err.message : 'Failed to save media item.');
        }
      }
    });
  };

  // Status toggle handler
  const handleToggleStatus = (item: AdminMediaItem, nextStatus: MediaStatus) => {
    startTransition(async () => {
      try {
        const updated = await updateMediaItemStatus(item._id || item.id!, nextStatus);
        setItems((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
        setNotice({
          type: 'success',
          message: `"${item.title}" status changed to ${nextStatus}.`,
        });
      } catch (err) {
        setNotice({
          type: 'error',
          message: err instanceof Error ? err.message : 'Could not change status.',
        });
      }
    });
  };

  // Delete handler
  const handleDelete = (item: AdminMediaItem) => {
    if (!confirm(`Are you sure you want to permanently delete "${item.title}"?`)) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteMediaItem(item._id || item.id!);
        setItems((prev) => prev.filter((m) => m._id !== item._id));
        setTotal((prev) => Math.max(0, prev - 1));
        setNotice({ type: 'success', message: `"${item.title}" deleted successfully.` });
      } catch (err) {
        setNotice({
          type: 'error',
          message: err instanceof Error ? err.message : 'Could not delete media item.',
        });
      }
    });
  };

  const totalPages = Math.ceil(total / 20) || 1;

  // Counts for summary pills
  const publishedCount = items.filter((m) => m.status === 'published').length;
  const youtubeCount = items.filter((m) => m.platform === 'youtube').length;
  const instagramCount = items.filter((m) => m.platform === 'instagram').length;

  return (
    <div className="space-y-4">

      {/* ── Notice Banner ─────────────────────────────────────────────── */}
      {notice && (
        <div
          className={`px-4 py-3 rounded-lg border text-xs sm:text-sm font-medium flex items-center justify-between shadow-2xs transition-all ${
            notice.type === 'success'
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
              : 'bg-red-50/90 border-red-200 text-red-800'
          }`}
          role="status"
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="p-1 rounded hover:bg-black/5 text-slate-500 hover:text-slate-800 cursor-pointer"
            aria-label="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Summary Counters ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-slate-200/90 p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Media</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{total}</p>
          </div>
          <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
            <Video className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200/90 p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Published</span>
            <p className="text-xl font-bold text-emerald-700 mt-0.5">{publishedCount}</p>
          </div>
          <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200/90 p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">YouTube Videos</span>
            <p className="text-xl font-bold text-red-600 mt-0.5">{youtubeCount}</p>
          </div>
          <div className="w-8 h-8 rounded-md bg-red-50 text-red-600 flex items-center justify-center">
            <YoutubeIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200/90 p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Instagram Reels</span>
            <p className="text-xl font-bold text-pink-600 mt-0.5">{instagramCount}</p>
          </div>
          <div className="w-8 h-8 rounded-md bg-pink-50 text-pink-600 flex items-center justify-center">
            <InstagramIcon className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ── Main Media Table Card ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        
        {/* Controls Toolbar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200/80 bg-white flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Left: Platform Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => {
                setPlatformFilter('all');
                loadData(1, search, 'all', statusFilter);
              }}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                platformFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Platforms
            </button>
            <button
              type="button"
              onClick={() => {
                setPlatformFilter('youtube');
                loadData(1, search, 'youtube', statusFilter);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition ${
                platformFilter === 'youtube'
                  ? 'bg-white text-red-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <YoutubeIcon className="w-3.5 h-3.5 text-red-600" />
              <span>YouTube</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPlatformFilter('instagram');
                loadData(1, search, 'instagram', statusFilter);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition ${
                platformFilter === 'instagram'
                  ? 'bg-white text-pink-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
              <span>Instagram</span>
            </button>
          </div>

          {/* Center: Search & Status Filter */}
          <div className="flex flex-1 items-center gap-2 max-w-md">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or category..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
              />
            </form>

            <select
              value={statusFilter}
              onChange={(e) => {
                const val = e.target.value as any;
                setStatusFilter(val);
                loadData(1, search, platformFilter, val);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
            >
              <option value="all">All Status</option>
              <option value="published">🟢 Published</option>
              <option value="draft">🟡 Draft</option>
              <option value="archived">⚪ Archived</option>
            </select>
          </div>

          {/* Right: Add Media Primary Button */}
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs font-semibold shadow-2xs transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Media</span>
          </button>
        </div>

        {/* Media Table */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#0F5638]" />
            <span>Loading media items...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">No media items found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add YouTube video links or Instagram Reels to display in the &ldquo;Recipes &amp; Vlogs&rdquo; section of your website.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#0F5638] text-white text-xs font-semibold shadow-2xs hover:bg-[#187A4F] transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Video</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/90 border-b border-slate-200/80 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">#</th>
                  <th className="py-2.5 px-4">Media</th>
                  <th className="py-2.5 px-3">Platform</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {items.map((item, idx) => {
                  const isYouTube = item.platform === 'youtube';
                  return (
                    <tr key={item._id || item.id || idx} className="hover:bg-slate-50/70 transition">
                      
                      {/* Order Index */}
                      <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                        {item.displayOrder || idx + 1}
                      </td>

                      {/* Thumbnail & Title */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-20 aspect-video rounded-md overflow-hidden bg-slate-900 border border-slate-200 shrink-0 group">
                            {item.thumbnailUrl ? (
                              <img
                                src={item.thumbnailUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                                <Video className="w-4 h-4" />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => setPreviewItem(item)}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer text-white"
                              title="Preview video"
                            >
                              <Play className="w-4 h-4 fill-white" />
                            </button>
                          </div>

                          <div className="min-w-0 max-w-sm">
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-slate-900 truncate" title={item.title}>
                                {item.title}
                              </p>
                              {item.featured && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  <span>Featured</span>
                                </span>
                              )}
                            </div>
                            {item.titleMl && (
                              <p className="text-[11px] text-slate-500 font-malayalam truncate" title={item.titleMl}>
                                {item.titleMl}
                              </p>
                            )}
                            <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                              ID: {item.externalId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Platform */}
                      <td className="py-2.5 px-3">
                        {isYouTube ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                            <YoutubeIcon className="w-3 h-3 text-red-600" />
                            <span>YouTube</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-pink-50 text-pink-700 border border-pink-200">
                            <InstagramIcon className="w-3 h-3 text-pink-600" />
                            <span>Reel</span>
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
                          {item.category}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                        {item.duration || '—'}
                      </td>

                      {/* Status (Clickable Toggle) */}
                      <td className="py-2.5 px-3">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() => {
                              const next = item.status === 'published' ? 'draft' : 'published';
                              handleToggleStatus(item, next);
                            }}
                            title="Click to toggle between Published and Draft"
                            className="cursor-pointer"
                          >
                            {item.status === 'published' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition">
                                ● Published
                              </span>
                            ) : item.status === 'draft' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition">
                                ○ Draft
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition">
                                Archived
                              </span>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                          title="Preview Video Player"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 inline-block rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                          title="Open external link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1 rounded text-slate-600 hover:text-[#0F5638] hover:bg-emerald-50 transition cursor-pointer"
                          title="Edit media details"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="Delete media item"
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
        )}

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total media)
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

      {/* ── Add / Edit Media Modal ────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#0F5638]/10 text-[#0F5638] flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {editingItem ? 'Edit Media Item' : 'Add New Media Item'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Add YouTube cooking videos or Instagram Reels for Recipes &amp; Vlogs.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form id="media-form" onSubmit={handleSaveMedia} className="p-5 space-y-4 text-xs max-h-[78vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Platform Toggle */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Platform <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlatform('youtube')}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                      platform === 'youtube'
                        ? 'bg-red-50 border-red-300 text-red-700 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <YoutubeIcon className="w-4 h-4 text-red-600" />
                    <span>YouTube Video</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlatform('instagram')}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                      platform === 'instagram'
                        ? 'bg-pink-50 border-pink-300 text-pink-700 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <InstagramIcon className="w-4 h-4 text-pink-600" />
                    <span>Instagram Reel</span>
                  </button>
                </div>
              </div>

              {/* 2. Media URL & Live Preview with Auto-Fetch */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold">
                    {platform === 'youtube' ? 'YouTube Video URL' : 'Instagram Reel URL'} <span className="text-red-500">*</span>
                  </label>
                  {livePreview.isValid && (
                    <button
                      type="button"
                      disabled={isFetchingMeta}
                      onClick={() => handleFetchMetadata(url, platform)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F5638] hover:text-[#187A4F] hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {isFetchingMeta ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      <span>{isFetchingMeta ? 'Fetching Details...' : 'Auto-Fetch Details'}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={url}
                    onChange={(e) => {
                      const nextUrl = e.target.value;
                      setUrl(nextUrl);
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData('text');
                      if (pasted && pasted.trim()) {
                        setTimeout(() => handleFetchMetadata(pasted.trim(), platform), 50);
                      }
                    }}
                    onBlur={() => {
                      if (livePreview.isValid && !title.trim()) {
                        handleFetchMetadata(url, platform);
                      }
                    }}
                    placeholder={
                      platform === 'youtube'
                        ? 'https://www.youtube.com/watch?v=... or https://youtu.be/...'
                        : 'https://www.instagram.com/reel/REEL_ID/ or /p/...'
                    }
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                  />
                  
                  <button
                    type="button"
                    disabled={isFetchingMeta || !url.trim()}
                    onClick={() => handleFetchMetadata(url, platform)}
                    className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                    title="Fetch title, thumbnail and details automatically"
                  >
                    {isFetchingMeta ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0F5638]" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-[#0F5638]" />
                    )}
                    <span className="hidden sm:inline">{isFetchingMeta ? 'Fetching...' : 'Fetch'}</span>
                  </button>
                </div>
                
                {/* Instant Live URL Status & Metadata Origin */}
                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  {url.trim() && (
                    <div>
                      {livePreview.isValid ? (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Valid {platform === 'youtube' ? 'YouTube' : 'Instagram'} link (ID: {livePreview.externalId})</span>
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{livePreview.error}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {metaFetchedVia && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                      <span>
                        {metaFetchedVia === 'youtube-data-api-v3'
                          ? 'Auto-populated via YouTube Data API v3'
                          : metaFetchedVia === 'youtube-oembed'
                          ? 'Auto-populated via YouTube oEmbed'
                          : metaFetchedVia === 'meta-oembed'
                          ? 'Auto-populated via Meta oEmbed'
                          : 'URL verified & normalized'}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Live Thumbnail Card & Custom Upload */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px]">
                    Thumbnail Image
                  </span>
                  
                  {/* Upload Custom Thumbnail to Cloudinary */}
                  <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-semibold hover:bg-slate-100 transition cursor-pointer shadow-2xs">
                    {isUploadingThumb ? (
                      <Loader2 className="w-3 h-3 animate-spin text-[#0F5638]" />
                    ) : (
                      <Upload className="w-3 h-3 text-[#0F5638]" />
                    )}
                    <span>{isUploadingThumb ? 'Uploading...' : 'Upload Custom Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingThumb}
                      onChange={handleThumbnailUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  {/* Thumbnail Preview Box */}
                  <div className="relative w-28 aspect-video rounded-md bg-slate-800 overflow-hidden border border-slate-200/90 shrink-0">
                    {thumbnailUrl || livePreview.defaultThumbnailUrl ? (
                      <img
                        src={thumbnailUrl || livePreview.defaultThumbnailUrl}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                        No thumbnail
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder={
                        platform === 'youtube'
                          ? 'Auto-generated or custom image URL'
                          : 'Custom thumbnail image URL (recommended for Reels)'
                      }
                      className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-[11px] focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                    />
                    <p className="text-[10px] text-slate-500">
                      {platform === 'youtube'
                        ? 'YouTube automatically fetches HQ thumbnails. You can override with a custom image.'
                        : 'Instagram Reels benefit from an uploaded cover image or high-quality photo.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Title & Malayalam Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Title (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Restaurant-Style Crispy Broasted Chicken"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Malayalam Title (മലയാളം)
                  </label>
                  <input
                    type="text"
                    value={titleMl}
                    onChange={(e) => setTitleMl(e.target.value)}
                    placeholder="e.g. റെസ്റ്റോറന്റ് സ്റ്റൈൽ ക്രിസ്പി ബ്രോസ്റ്റഡ് ചിക്കൻ"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-malayalam focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                  />
                </div>
              </div>

              {/* 4. Description & Malayalam Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Short Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short summary of this recipe vlog..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Malayalam Description (മലയാളം)
                  </label>
                  <textarea
                    rows={2}
                    value={descriptionMl}
                    onChange={(e) => setDescriptionMl(e.target.value)}
                    placeholder="വിവരണ കുറിപ്പ്..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-malayalam focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                  />
                </div>
              </div>

              {/* 5. Category, Duration, Order & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                
                {/* Category */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Category Badge <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                  >
                    {POPULAR_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="Custom">+ Custom Category</option>
                  </select>
                  {category === 'Custom' && (
                    <input
                      type="text"
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter category name"
                      className="mt-1 w-full px-2 py-1 rounded border border-slate-200 text-xs"
                    />
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Duration (e.g. 12:45)
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="12:45 or 0:30"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                  />
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                  />
                </div>

                {/* Publication Status */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as MediaStatus)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                  >
                    <option value="published">🟢 Published (Live)</option>
                    <option value="draft">🟡 Draft (Hidden)</option>
                    <option value="archived">⚪ Archived</option>
                  </select>
                </div>
              </div>

              {/* 6. Featured Toggle */}
              <div className="pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded border-slate-300 text-[#0F5638] focus:ring-[#0F5638]"
                  />
                  <span className="font-semibold text-slate-700">Feature this video prominently</span>
                </label>
              </div>

            </form>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-3.5 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 transition font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="media-form"
                disabled={isPending || isUploadingThumb}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#0F5638] hover:bg-[#187A4F] text-white font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{editingItem ? 'Update Media' : 'Publish Media'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Video Player Preview Modal ─────────────────────────────────── */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
            
            <div className="px-4 py-3 bg-slate-800 flex items-center justify-between text-white border-b border-slate-700">
              <div className="flex items-center gap-2 truncate">
                {previewItem.platform === 'youtube' ? (
                  <YoutubeIcon className="w-4 h-4 text-red-500 shrink-0" />
                ) : (
                  <InstagramIcon className="w-4 h-4 text-pink-500 shrink-0" />
                )}
                <span className="font-semibold text-xs truncate">{previewItem.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              {previewItem.platform === 'youtube' ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${previewItem.externalId}?autoplay=1&rel=0`}
                  title={previewItem.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="p-8 text-center text-white space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg">
                    <InstagramIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold">{previewItem.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">{previewItem.description}</p>
                  </div>
                  <a
                    href={previewItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold shadow-md hover:opacity-90 transition"
                  >
                    <span>Watch Reel on Instagram</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
