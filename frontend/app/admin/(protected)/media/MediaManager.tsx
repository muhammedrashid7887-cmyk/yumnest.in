'use client';

import React, { useState, useTransition, useMemo, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Video,
  Play,
  Upload,
  Pencil,
  Trash2,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Film,
  FileVideo,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { AdminTableRowSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { YoutubeIcon, InstagramIcon } from '@/components/common/BrandMediaIcons';
import {
  fetchAdminMediaItems,
  createMediaItem,
  updateMediaItem,
  updateMediaItemStatus,
  deleteMediaItem,
  fetchMediaMetadata,
} from '@/lib/api/media';
import {
  getVideoUploadSignature,
  uploadVideoDirectToCloudinary,
  uploadVideoFallback,
  createVideoRecord,
  updateVideoRecord,
  deleteVideo,
  replaceVideoFile,
} from '@/lib/api/videos';
import {
  detectPlatformFromUrl,
  fetchFastYouTubeOembed,
  parseYouTubeVideoId,
} from '@/lib/utils/media-url';
import type {
  AdminMediaItem,
  MediaPlatform,
  MediaStatus,
  MediaItemInput,
  MediaItemUpdateInput,
} from '@/types/api';
import { ApiRequestError } from '@/types/api';
import { useAdminSocket, useSocketEvent } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/lib/socket/events';

interface MediaManagerProps {
  initialMedia: AdminMediaItem[];
  initialTotal: number;
}

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska',
];

const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaManager({
  initialMedia,
  initialTotal,
}: MediaManagerProps) {
  const [items, setItems] = useState<AdminMediaItem[]>(initialMedia);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'native' | 'youtube' | 'instagram'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();

  // Create / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminMediaItem | null>(null);

  // Upload Mode: 'file' (direct device upload) or 'link' (YouTube/Instagram)
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<MediaStatus>('published');

  // Link mode specific
  const [linkPlatform, setLinkPlatform] = useState<'youtube' | 'instagram'>('youtube');
  const [linkUrl, setLinkUrl] = useState('');
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);

  // File mode specific
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localVideoPreviewUrl, setLocalVideoPreviewUrl] = useState<string | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // General errors & preview player
  const [formError, setFormError] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<AdminMediaItem | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Cleanup object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (localVideoPreviewUrl && localVideoPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localVideoPreviewUrl);
      }
    };
  }, [localVideoPreviewUrl]);

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

  // Real-time synchronization
  useAdminSocket();

  useSocketEvent(SOCKET_EVENTS.VIDEO_CREATED, () => {
    loadData(page, search, platformFilter, statusFilter);
  });

  useSocketEvent(SOCKET_EVENTS.VIDEO_UPDATED, () => {
    loadData(page, search, platformFilter, statusFilter);
  });

  useSocketEvent(SOCKET_EVENTS.VIDEO_DELETED, (payload?: { id?: string; externalId?: string }) => {
    if (payload?.id || payload?.externalId) {
      setItems((prev) =>
        prev.filter(
          (m) =>
            m._id !== payload.id &&
            m.id !== payload.id &&
            m.externalId !== payload.id &&
            m.externalId !== payload.externalId
        )
      );
    }
    loadData(page, search, platformFilter, statusFilter);
  });

  // Modal Open Handlers
  const openCreateModal = () => {
    if (localVideoPreviewUrl && localVideoPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(localVideoPreviewUrl);
    }
    setEditingItem(null);
    setUploadMode('file');
    setTitle('');
    setDescription('');
    setStatus('published');
    setSelectedFile(null);
    setLocalVideoPreviewUrl(null);
    setLinkPlatform('youtube');
    setLinkUrl('');
    setUploadProgress(0);
    setIsUploadingVideo(false);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (item: AdminMediaItem) => {
    if (localVideoPreviewUrl && localVideoPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(localVideoPreviewUrl);
    }
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description || '');
    setStatus(item.status);
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploadingVideo(false);
    setFormError(null);

    if (item.platform === 'native') {
      setUploadMode('file');
      setLocalVideoPreviewUrl(item.url);
      setLinkUrl('');
    } else {
      setUploadMode('link');
      setLinkPlatform(item.platform as 'youtube' | 'instagram');
      setLinkUrl(item.url);
      setLocalVideoPreviewUrl(null);
    }

    setModalOpen(true);
  };

  // Handle Video File Selection with Instant Preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValidExt = file.name.match(/\.(mp4|webm|mov|mkv)$/i);
    const isValidMime = ALLOWED_VIDEO_TYPES.includes(file.type);
    if (!isValidExt && !isValidMime) {
      setFormError('Please select a valid video file (MP4, WebM, or MOV).');
      return;
    }

    if (file.size > MAX_VIDEO_BYTES) {
      setFormError(`Video exceeds ${formatFileSize(MAX_VIDEO_BYTES)} limit. Selected file is ${formatFileSize(file.size)}.`);
      return;
    }

    if (localVideoPreviewUrl && localVideoPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(localVideoPreviewUrl);
    }

    const preview = URL.createObjectURL(file);
    setSelectedFile(file);
    setLocalVideoPreviewUrl(preview);
    setFormError(null);

    // Auto-fill title from file name if blank
    if (!title.trim() && !editingItem) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .trim();
      if (cleanName) {
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  // Auto-Fetch YouTube/Instagram Metadata
  const handleFetchMetadata = async (rawUrl: string) => {
    const raw = rawUrl.trim();
    if (!raw) return;

    const detected = detectPlatformFromUrl(raw);
    const effPlatform = detected || linkPlatform;
    if (detected && detected !== linkPlatform) {
      setLinkPlatform(detected);
    }

    try {
      setIsFetchingMeta(true);
      setFormError(null);

      if (effPlatform === 'youtube') {
        const videoId = parseYouTubeVideoId(raw);
        if (videoId) {
          const fastOembed = await fetchFastYouTubeOembed(videoId);
          if (fastOembed?.title && (!title.trim() || !editingItem)) {
            setTitle(fastOembed.title);
            setIsFetchingMeta(false);
            return;
          }
        }
      }

      const meta = await fetchMediaMetadata(effPlatform, raw);
      if (meta.title && (!title.trim() || !editingItem)) {
        const cleanTitle = meta.title
          .split('\n')[0]
          .replace(/https?:\/\/\S+/gi, '')
          .replace(/[#@]\S+/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (cleanTitle) {
          setTitle(cleanTitle);
        }
      }
      if (meta.description && (!description.trim() || !editingItem)) {
        setDescription(meta.description);
      }
    } catch {
      // Non-fatal, admin can enter title manually
    } finally {
      setIsFetchingMeta(false);
    }
  };

  // Save Video Handler (File Upload or Link)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim();
    if (!finalTitle) {
      setFormError('Video Title is required.');
      return;
    }

    setFormError(null);

    // MODE 1: Direct Video File Upload
    if (uploadMode === 'file') {
      // Case A: Editing existing native video without replacing the file
      if (editingItem && !selectedFile) {
        try {
          setIsUploadingVideo(true);
          const updatePayload: MediaItemUpdateInput = {
            title: finalTitle,
            description: description.trim(),
            status,
          };
          const updated = await updateMediaItem(editingItem._id || editingItem.id!, updatePayload);
          setItems((prev) => prev.map((m) => ((m._id || m.id) === (updated._id || updated.id) ? updated : m)));
          setNotice({ type: 'success', message: `Video "${finalTitle}" updated successfully.` });
          setModalOpen(false);
        } catch (err) {
          setFormError(err instanceof Error ? err.message : 'Failed to update video.');
        } finally {
          setIsUploadingVideo(false);
        }
        return;
      }

      // Case B: Uploading a new video file (or replacing file in existing record)
      if (!selectedFile) {
        setFormError('Please select a video file (MP4 or WebM) from your device.');
        return;
      }

      try {
        setIsUploadingVideo(true);
        setUploadProgress(0);
        setUploadStatusText('Preparing secure video upload...');

        let uploadResult: {
          publicId: string;
          assetId?: string;
          secureUrl: string;
          duration: number;
          format: string;
          width: number;
          height: number;
          bytes: number;
        };

        // Attempt direct-to-Cloudinary upload for real-time progress
        try {
          const sig = await getVideoUploadSignature();
          setUploadStatusText('Uploading video to Cloudinary...');
          uploadResult = await uploadVideoDirectToCloudinary(selectedFile, sig, (percent) => {
            setUploadProgress(percent);
            setUploadStatusText(`Uploading video... ${percent}%`);
          });
        } catch {
          // Fallback to server-side upload stream
          setUploadStatusText('Uploading video via server fallback...');
          uploadResult = await uploadVideoFallback(selectedFile, (percent) => {
            setUploadProgress(percent);
            setUploadStatusText(`Uploading video... ${percent}%`);
          });
        }

        setUploadStatusText('Saving video details to database...');

        if (editingItem) {
          // Replace video file
          await replaceVideoFile(editingItem._id || editingItem.id!, {
            cloudinaryPublicId: uploadResult.publicId,
            cloudinaryAssetId: uploadResult.assetId,
            videoUrl: uploadResult.secureUrl,
            duration: uploadResult.duration,
            format: uploadResult.format,
            width: uploadResult.width,
            height: uploadResult.height,
            fileSize: uploadResult.bytes,
            thumbnailUrl: uploadResult.secureUrl.replace(/\.[^/.]+$/, '.jpg'),
          });

          await updateVideoRecord(editingItem._id || editingItem.id!, {
            title: finalTitle,
            description: description.trim(),
            isPublished: status === 'published',
          });

          setNotice({ type: 'success', message: `Video "${finalTitle}" replaced and updated.` });
        } else {
          // Create new video record
          const createdVideo = await createVideoRecord({
            title: finalTitle,
            description: description.trim(),
            cloudinaryPublicId: uploadResult.publicId,
            cloudinaryAssetId: uploadResult.assetId,
            videoUrl: uploadResult.secureUrl,
            thumbnailUrl: uploadResult.secureUrl.replace(/\.[^/.]+$/, '.jpg'),
            duration: uploadResult.duration,
            format: uploadResult.format,
            width: uploadResult.width,
            height: uploadResult.height,
            fileSize: uploadResult.bytes,
            category: 'General',
            isPublished: status === 'published',
            displayOrder: items.length + 1,
          });

          const mappedItem: AdminMediaItem = {
            _id: String(createdVideo._id || createdVideo.id),
            id: String(createdVideo._id || createdVideo.id),
            platform: 'native',
            url: createdVideo.videoUrl,
            externalId: createdVideo.cloudinaryPublicId,
            title: createdVideo.title,
            description: createdVideo.description || '',
            category: createdVideo.category || 'General',
            thumbnailUrl: createdVideo.customThumbnailUrl || createdVideo.thumbnailUrl,
            cloudinaryPublicId: createdVideo.cloudinaryPublicId,
            duration: createdVideo.durationFormatted || 'Video',
            status: createdVideo.isPublished ? 'published' : 'draft',
            featured: false,
            displayOrder: createdVideo.displayOrder ?? 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          setItems((prev) => [mappedItem, ...prev]);
          setTotal((prev) => prev + 1);
          setNotice({ type: 'success', message: `Video "${finalTitle}" uploaded and published.` });
        }

        setModalOpen(false);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Video upload failed. Please try again.');
      } finally {
        setIsUploadingVideo(false);
        setUploadProgress(0);
        setUploadStatusText('');
      }
      return;
    }

    // MODE 2: Video Link (YouTube / Instagram)
    if (uploadMode === 'link') {
      if (!linkUrl.trim()) {
        setFormError('Please enter a valid video link.');
        return;
      }

      try {
        setIsUploadingVideo(true);
        if (editingItem) {
          const updatePayload: MediaItemUpdateInput = {
            platform: linkPlatform,
            url: linkUrl.trim(),
            title: finalTitle,
            description: description.trim(),
            status,
          };
          const updated = await updateMediaItem(editingItem._id || editingItem.id!, updatePayload);
          setItems((prev) => prev.map((m) => ((m._id || m.id) === (updated._id || updated.id) ? updated : m)));
          setNotice({ type: 'success', message: `Video link "${finalTitle}" updated.` });
        } else {
          const createPayload: MediaItemInput = {
            platform: linkPlatform,
            url: linkUrl.trim(),
            title: finalTitle,
            description: description.trim(),
            category: 'General',
            status,
            featured: false,
            displayOrder: items.length + 1,
          };
          const created = await createMediaItem(createPayload);
          setItems((prev) => [created, ...prev]);
          setTotal((prev) => prev + 1);
          setNotice({ type: 'success', message: `Video link "${finalTitle}" published.` });
        }
        setModalOpen(false);
      } catch (err) {
        if (err instanceof ApiRequestError) {
          setFormError(err.message);
        } else {
          setFormError(err instanceof Error ? err.message : 'Failed to save video link.');
        }
      } finally {
        setIsUploadingVideo(false);
      }
    }
  };

  // Status toggle handler
  const handleToggleStatus = async (item: AdminMediaItem, nextStatus: MediaStatus) => {
    try {
      const updated = await updateMediaItemStatus(item._id || item.id!, nextStatus);
      setItems((prev) =>
        prev.map((m) => ((m._id || m.id) === (item._id || item.id) ? { ...m, status: updated.status } : m))
      );
      setNotice({
        type: 'success',
        message: `"${item.title}" is now ${nextStatus}.`,
      });
    } catch (err) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Could not change status.',
      });
    }
  };

  // Delete handler: deletes from MongoDB and Cloudinary
  const handleDelete = async (item: AdminMediaItem) => {
    if (!confirm(`Are you sure you want to permanently delete "${item.title}"?\n\nThis will remove the video from both the admin panel and the customer website immediately.`)) {
      return;
    }

    const targetId = item._id || item.id!;
    try {
      if (item.platform === 'native') {
        await deleteVideo(targetId);
      } else {
        await deleteMediaItem(targetId);
      }
      setItems((prev) => prev.filter((m) => (m._id || m.id) !== targetId));
      setTotal((prev) => Math.max(0, prev - 1));
      setNotice({ type: 'success', message: `Video "${item.title}" was permanently deleted.` });
    } catch (err) {
      // If already deleted/not found, cleanly remove from local state
      const isNotFound =
        (err instanceof ApiRequestError && (err.statusCode === 404 || err.code === 'NOT_FOUND')) ||
        (err instanceof Error && err.message.toLowerCase().includes('not found'));
      if (isNotFound) {
        setItems((prev) => prev.filter((m) => (m._id || m.id) !== targetId));
        setTotal((prev) => Math.max(0, prev - 1));
        setNotice({ type: 'success', message: `"${item.title}" removed.` });
      } else {
        setNotice({
          type: 'error',
          message: err instanceof Error ? err.message : 'Could not delete video.',
        });
      }
    }
  };

  const totalPages = Math.ceil(total / 20) || 1;
  const publishedCount = items.filter((m) => m.status === 'published').length;
  const nativeCount = items.filter((m) => m.platform === 'native').length;
  const linkCount = items.filter((m) => m.platform === 'youtube' || m.platform === 'instagram').length;

  return (
    <div className="space-y-4">

      {/* ── Notice Alert Banner ────────────────────────────────────────── */}
      {notice && (
        <div
          className={`px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-between shadow-2xs transition-all ${
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
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Videos</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{total}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Video className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Published</span>
            <p className="text-xl font-bold text-emerald-700 mt-0.5">{publishedCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Uploaded MP4</span>
            <p className="text-xl font-bold text-indigo-600 mt-0.5">{nativeCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Film className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Links (YT/IG)</span>
            <p className="text-xl font-bold text-red-600 mt-0.5">{linkCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <YoutubeIcon className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* ── Main Media Card ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        
        {/* Controls Toolbar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200/80 bg-white flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Left: Platform Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                setPlatformFilter('all');
                loadData(1, search, 'all', statusFilter);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                platformFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Videos
            </button>
            <button
              type="button"
              onClick={() => {
                setPlatformFilter('native');
                loadData(1, search, 'native', statusFilter);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                platformFilter === 'native'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-indigo-600" />
              <span>Uploaded MP4</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPlatformFilter('youtube');
                loadData(1, search, 'youtube', statusFilter);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
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
                placeholder="Search videos by title..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
              />
            </form>

            <select
              value={statusFilter}
              onChange={(e) => {
                const val = e.target.value as 'all' | 'published' | 'draft' | 'archived';
                setStatusFilter(val);
                loadData(1, search, platformFilter, val);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
            >
              <option value="all">All Status</option>
              <option value="published">🟢 Published</option>
              <option value="draft">🟡 Draft</option>
            </select>
          </div>

          {/* Right: Upload Video Primary Button */}
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs font-semibold shadow-2xs transition shrink-0 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Video</span>
          </button>
        </div>

        {/* Media Content */}
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 p-3 space-y-2 animate-pulse">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-24 aspect-video rounded-lg bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-slate-200 rounded" />
                    <Skeleton className="h-3 w-1/3 bg-slate-100 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#0F5638] mx-auto flex items-center justify-center mb-3 shadow-2xs">
              <FileVideo className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">No videos found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Upload your MP4/WebM cooking videos directly or add video links to showcase culinary masterclasses on your customer website.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F5638] text-white text-xs font-semibold shadow-2xs hover:bg-[#187A4F] transition cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Video Now</span>
            </button>
          </div>
        ) : (
          <div>
            {/* Mobile Card Layout (< 768px) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {items.map((item, idx) => {
                const isNative = item.platform === 'native';
                const isYouTube = item.platform === 'youtube';
                return (
                  <div key={item._id || item.id || idx} className="p-4 space-y-3 hover:bg-slate-50/70 transition">
                    <div className="flex items-start gap-3">
                      <div className="relative w-24 aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 shadow-2xs group">
                        <img
                          src={
                            item.thumbnailUrl ||
                            (isYouTube
                              ? `https://img.youtube.com/vi/${item.externalId}/hqdefault.jpg`
                              : isNative
                              ? item.url.replace(/\.[^/.]+$/, '.jpg')
                              : '/assets/instagram-reel-placeholder.png')
                          }
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/instagram-reel-placeholder.png';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          className="absolute inset-0 bg-black/35 flex items-center justify-center text-white cursor-pointer"
                          title="Preview video"
                        >
                          <div className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center border border-white/40 shadow-xs">
                            <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                          </div>
                        </button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {isNative ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <Film className="w-2.5 h-2.5 text-indigo-600" />
                              <span>MP4 File</span>
                            </span>
                          ) : isYouTube ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                              <YoutubeIcon className="w-2.5 h-2.5 text-red-600" />
                              <span>YouTube</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
                              <InstagramIcon className="w-2.5 h-2.5 text-pink-600" />
                              <span>Reel</span>
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.duration || 'Video'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          const next = item.status === 'published' ? 'draft' : 'published';
                          handleToggleStatus(item, next);
                        }}
                        className="cursor-pointer"
                      >
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.status === 'published' ? '● Published' : '○ Draft'}
                        </span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                        >
                          Watch
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg border border-slate-200 text-red-500 hover:bg-red-50 transition"
                          title="Delete video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/90 border-b border-slate-200/80 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Video Details</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Duration</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {items.map((item, idx) => {
                    const isNative = item.platform === 'native';
                    const isYouTube = item.platform === 'youtube';
                    return (
                      <tr key={item._id || item.id || idx} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1 + (page - 1) * 20}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-24 aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 group shadow-2xs">
                              <img
                                src={
                                  item.thumbnailUrl ||
                                  (isYouTube
                                    ? `https://img.youtube.com/vi/${item.externalId}/hqdefault.jpg`
                                    : isNative
                                    ? item.url.replace(/\.[^/.]+$/, '.jpg')
                                    : '/assets/instagram-reel-placeholder.png')
                                }
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/assets/instagram-reel-placeholder.png';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => setPreviewItem(item)}
                                className="absolute inset-0 bg-black/35 flex items-center justify-center text-white cursor-pointer"
                                title="Watch preview"
                              >
                                <div className="w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center border border-white/40 shadow-xs">
                                  <Play className="w-3 h-3 fill-white ml-0.5" />
                                </div>
                              </button>
                            </div>

                            <div className="min-w-0 max-w-md">
                              <p className="font-bold text-slate-900 text-xs truncate" title={item.title}>
                                {item.title}
                              </p>
                              {item.description ? (
                                <p className="text-[11px] text-slate-500 truncate mt-0.5" title={item.description}>
                                  {item.description}
                                </p>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic mt-0.5">
                                  No description added
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          {isNative ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <Film className="w-3 h-3 text-indigo-600" />
                              <span>Uploaded MP4</span>
                            </span>
                          ) : isYouTube ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                              <YoutubeIcon className="w-3 h-3 text-red-600" />
                              <span>YouTube</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
                              <InstagramIcon className="w-3 h-3 text-pink-600" />
                              <span>Instagram Reel</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                          {item.duration || '—'}
                        </td>

                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => {
                              const next = item.status === 'published' ? 'draft' : 'published';
                              handleToggleStatus(item, next);
                            }}
                            className="cursor-pointer"
                            title="Click to toggle publish status"
                          >
                            {item.status === 'published' ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition">
                                ● Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition">
                                ○ Draft
                              </span>
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right space-x-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                            title="Watch Video"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#0F5638] hover:bg-emerald-50 transition cursor-pointer"
                            title="Edit Title & Description"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Delete video"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total videos)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() => loadData(page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages || isLoading}
              onClick={() => loadData(page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* ── Add / Edit Video Modal ────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-2xs overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0F5638]/10 text-[#0F5638] flex items-center justify-center">
                  <Video className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    {editingItem ? 'Edit Video' : 'Add New Video'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Upload normal video files or paste video links.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isUploadingVideo}
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer disabled:opacity-30"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Upload Mode Selector (File Upload vs Video Link) */}
              {!editingItem && (
                <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadMode('file');
                      setFormError(null);
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      uploadMode === 'file'
                        ? 'bg-white text-[#0F5638] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Video File (MP4/WebM)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadMode('link');
                      setFormError(null);
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      uploadMode === 'link'
                        ? 'bg-white text-[#0F5638] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Video Link (YouTube / Instagram)</span>
                  </button>
                </div>
              )}

              {/* ── Mode 1: Device Video File Upload ───────────────────────── */}
              {uploadMode === 'file' && (
                <div className="space-y-3">
                  <label className="block text-slate-800 font-bold">
                    Video File <span className="text-red-500">*</span>
                  </label>

                  {localVideoPreviewUrl ? (
                    <div className="space-y-2">
                      {/* Video Player Preview */}
                      <div className="relative w-full aspect-video rounded-xl bg-black overflow-hidden border border-slate-200 shadow-md">
                        <video
                          src={localVideoPreviewUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 truncate">
                          <FileVideo className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold truncate">
                            {selectedFile ? selectedFile.name : editingItem?.title || 'Selected Video'}
                          </span>
                          {selectedFile && (
                            <span className="text-slate-400 font-mono">
                              ({formatFileSize(selectedFile.size)})
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          disabled={isUploadingVideo}
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[#0F5638] font-bold hover:bg-slate-100 transition cursor-pointer shrink-0 disabled:opacity-40"
                        >
                          Change File
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Drag & Drop File Zone */
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-[#0F5638] rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50/50 hover:bg-emerald-50/20"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 text-[#0F5638] mx-auto flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-800 text-xs">
                        Click to browse or drag &amp; drop video here
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Supports MP4, WebM, MOV (Max file size: 100MB)
                      </p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.mkv"
                    disabled={isUploadingVideo}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}

              {/* ── Mode 2: External Video Link ───────────────────────────── */}
              {uploadMode === 'link' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-800 font-bold">
                      Platform
                    </label>
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
                      <button
                        type="button"
                        onClick={() => setLinkPlatform('youtube')}
                        className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          linkPlatform === 'youtube'
                            ? 'bg-white text-red-600 shadow-2xs'
                            : 'text-slate-600'
                        }`}
                      >
                        <YoutubeIcon className="w-3.5 h-3.5 text-red-600" />
                        <span>YouTube</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLinkPlatform('instagram')}
                        className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          linkPlatform === 'instagram'
                            ? 'bg-white text-pink-600 shadow-2xs'
                            : 'text-slate-600'
                        }`}
                      >
                        <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
                        <span>Instagram Reel</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">
                      {linkPlatform === 'youtube' ? 'YouTube Video URL' : 'Instagram Reel URL'} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        onBlur={() => {
                          if (linkUrl.trim() && !title.trim()) {
                            handleFetchMetadata(linkUrl);
                          }
                        }}
                        placeholder={
                          linkPlatform === 'youtube'
                            ? 'https://www.youtube.com/watch?v=... or https://youtu.be/...'
                            : 'https://www.instagram.com/reel/...'
                        }
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                      />
                      <button
                        type="button"
                        disabled={isFetchingMeta || !linkUrl.trim()}
                        onClick={() => handleFetchMetadata(linkUrl)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer disabled:opacity-40 shrink-0"
                        title="Auto-fetch video title"
                      >
                        {isFetchingMeta ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-[#0F5638]" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Required Field: Video Title ────────────────────────────── */}
              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  Video Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title (e.g. Crispy Broasted Chicken Masterclass)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                />
              </div>

              {/* ── Optional Field: Video Description ──────────────────────── */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Description <span className="text-[11px] text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief notes or culinary details (optional)..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                />
              </div>

              {/* ── Status Option ─────────────────────────────────────────── */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-700 font-bold">Publish to Website</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MediaStatus)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                >
                  <option value="published">🟢 Published (Live)</option>
                  <option value="draft">🟡 Draft (Hidden)</option>
                </select>
              </div>

              {/* ── Upload Progress Bar ───────────────────────────────────── */}
              {isUploadingVideo && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0F5638]" />
                      <span>{uploadStatusText || 'Uploading video...'}</span>
                    </span>
                    <span className="font-mono text-[#0F5638]">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-[#0F5638] transition-all duration-300 ease-out"
                      style={{ width: `${Math.max(5, uploadProgress)}%` }}
                    />
                  </div>
                </div>
              )}

            </form>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isUploadingVideo}
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition font-semibold cursor-pointer disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUploadingVideo}
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0F5638] hover:bg-[#187A4F] text-white font-bold shadow-2xs transition disabled:opacity-50 cursor-pointer"
              >
                {isUploadingVideo && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {isUploadingVideo
                    ? 'Uploading...'
                    : editingItem
                    ? 'Save Changes'
                    : 'Upload & Save Video'}
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Video Player Preview Modal ─────────────────────────────────── */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-3xl bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
            
            <div className="px-4 py-3 bg-slate-900 flex items-center justify-between text-white border-b border-slate-800">
              <div className="flex items-center gap-2 truncate pr-2">
                {previewItem.platform === 'native' ? (
                  <Film className="w-4 h-4 text-indigo-400 shrink-0" />
                ) : previewItem.platform === 'youtube' ? (
                  <YoutubeIcon className="w-4 h-4 text-red-500 shrink-0" />
                ) : (
                  <InstagramIcon className="w-4 h-4 text-pink-500 shrink-0" />
                )}
                <span className="font-bold text-xs sm:text-sm truncate text-slate-200">
                  {previewItem.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              {previewItem.platform === 'native' ? (
                <video
                  src={previewItem.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : previewItem.platform === 'youtube' ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${previewItem.externalId}?autoplay=1&rel=0`}
                  title={previewItem.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <iframe
                  src={`https://www.instagram.com/reel/${previewItem.externalId}/embed/`}
                  title={previewItem.title}
                  className="w-full max-w-[400px] h-[520px] rounded-xl border-0 shadow-2xl bg-white"
                  allowFullScreen
                  scrolling="no"
                />
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
