'use client';

import React, { useState, useEffect, useRef, useTransition, useCallback } from 'react';
import Image from 'next/image';
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
  Filter,
  Sparkles,
  Clock,
  Eye,
  ImageIcon,
  RefreshCw,
  Film,
  FileVideo,
  Layers,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import {
  fetchAdminVideos,
  getVideoUploadSignature,
  uploadVideoDirectToCloudinary,
  uploadVideoFallback,
  createVideoRecord,
  updateVideoRecord,
  toggleVideoPublish,
  regenerateVideoThumbnail,
  replaceVideoFile,
  deleteVideo,
} from '@/lib/api/videos';
import { uploadMediaThumbnail } from '@/lib/api/media';
import { NativeVideoPlayer } from '@/components/video/NativeVideoPlayer';
import { useSocketEvent } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/lib/socket/events';
import type { NativeVideo, CreateVideoInput, UpdateVideoInput, ReplaceVideoInput } from '@/types/api';

const POPULAR_CATEGORIES = [
  'Broast Special',
  'Signature Rubs',
  'Heritage Recipes',
  'Seafood Specials',
  'Cooking Masterclass',
  'Kitchen Tips',
  'Vlogs & Stories',
];

interface NativeVideoManagerProps {
  initialVideos: NativeVideo[];
  initialTotal: number;
}

export function NativeVideoManager({ initialVideos, initialTotal }: NativeVideoManagerProps) {
  const [videos, setVideos] = useState<NativeVideo[]>(initialVideos);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<NativeVideo | null>(null);
  const [replacingVideo, setReplacingVideo] = useState<NativeVideo | null>(null);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localFilePreviewUrl, setLocalFilePreviewUrl] = useState<string | null>(null);
  const [fileMetadata, setFileMetadata] = useState<{ duration: number; width: number; height: number } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<'idle' | 'signing' | 'uploading' | 'saving' | 'complete' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(POPULAR_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState<string | null>(null);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [instagramSourceUrl, setInstagramSourceUrl] = useState('');

  // Thumbnail Regeneration Modal / State
  const [thumbnailModalVideo, setThumbnailModalVideo] = useState<NativeVideo | null>(null);
  const [regenOffset, setRegenOffset] = useState<number>(1);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Playback Preview Modal
  const [previewVideo, setPreviewVideo] = useState<NativeVideo | null>(null);

  // Notice Toast Banner
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  // Load video list
  const loadVideos = useCallback(
    async (
      newPage = page,
      querySearch = search,
      queryStatus = statusFilter,
      queryCategory = categoryFilter
    ) => {
      setLoading(true);
      try {
        const res = await fetchAdminVideos({
          page: newPage,
          limit: 20,
          search: querySearch || undefined,
          status: queryStatus,
          category: queryCategory,
        });
        setVideos(res.items);
        setTotal(res.total);
        setPage(newPage);
      } catch (err) {
        setNotice({
          type: 'error',
          message: err instanceof Error ? err.message : 'Failed to query videos.',
        });
      } finally {
        setLoading(false);
      }
    },
    [page, search, statusFilter, categoryFilter]
  );

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  // Socket.IO real-time synchronization
  useSocketEvent(SOCKET_EVENTS.VIDEO_CREATED, () => loadVideos());
  useSocketEvent(SOCKET_EVENTS.VIDEO_UPDATED, () => loadVideos());
  useSocketEvent(SOCKET_EVENTS.VIDEO_PUBLISHED, () => loadVideos());
  useSocketEvent(SOCKET_EVENTS.VIDEO_UNPUBLISHED, () => loadVideos());
  useSocketEvent(SOCKET_EVENTS.VIDEO_DELETED, () => loadVideos());

  // Clean local file preview URL when changed
  useEffect(() => {
    return () => {
      if (localFilePreviewUrl) URL.revokeObjectURL(localFilePreviewUrl);
    };
  }, [localFilePreviewUrl]);

  // Handle Video File Selection
  const handleFileSelect = (file: File) => {
    setUploadError(null);

    // Validate type
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|mkv)$/i)) {
      setUploadError('Invalid format. Please select an MP4, WebM, or MOV video file.');
      return;
    }

    // Validate size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      setUploadError('Video file exceeds 100MB. Please compress your video or select a smaller file.');
      return;
    }

    setSelectedFile(file);

    // Create local preview
    if (localFilePreviewUrl) URL.revokeObjectURL(localFilePreviewUrl);
    const previewUrl = URL.createObjectURL(file);
    setLocalFilePreviewUrl(previewUrl);

    // Set initial title from filename if empty
    if (!title && !editingVideo) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Inspect video duration and dimensions via offscreen HTML5 video
    const offscreenVideo = document.createElement('video');
    offscreenVideo.preload = 'metadata';
    offscreenVideo.src = previewUrl;
    offscreenVideo.onloadedmetadata = () => {
      setFileMetadata({
        duration: offscreenVideo.duration || 0,
        width: offscreenVideo.videoWidth || 1280,
        height: offscreenVideo.videoHeight || 720,
      });
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingVideo(null);
    setReplacingVideo(null);
    setSelectedFile(null);
    if (localFilePreviewUrl) URL.revokeObjectURL(localFilePreviewUrl);
    setLocalFilePreviewUrl(null);
    setFileMetadata(null);
    setTitle('');
    setDescription('');
    setCategory(POPULAR_CATEGORIES[0]);
    setCustomCategory('');
    setIsPublished(true);
    setDisplayOrder(total + 1);
    setCustomThumbnailUrl(null);
    setInstagramSourceUrl('');
    setUploadProgress(0);
    setUploadStage('idle');
    setUploadError(null);
    setModalOpen(true);
  };

  // Open Edit Metadata Modal
  const openEditModal = (video: NativeVideo) => {
    setEditingVideo(video);
    setReplacingVideo(null);
    setSelectedFile(null);
    setLocalFilePreviewUrl(null);
    setFileMetadata(null);
    setTitle(video.title);
    setDescription(video.description || '');
    if (POPULAR_CATEGORIES.includes(video.category)) {
      setCategory(video.category);
      setCustomCategory('');
    } else {
      setCategory('other');
      setCustomCategory(video.category);
    }
    setIsPublished(video.isPublished);
    setDisplayOrder(video.displayOrder || 1);
    setCustomThumbnailUrl(video.customThumbnailUrl || null);
    setInstagramSourceUrl(video.instagramSourceUrl || '');
    setUploadProgress(0);
    setUploadStage('idle');
    setUploadError(null);
    setModalOpen(true);
  };

  // Open Replace Video File Modal
  const openReplaceModal = (video: NativeVideo) => {
    setEditingVideo(null);
    setReplacingVideo(video);
    setSelectedFile(null);
    setLocalFilePreviewUrl(null);
    setFileMetadata(null);
    setTitle(video.title);
    setDescription(video.description || '');
    setCategory(video.category);
    setCustomCategory('');
    setIsPublished(video.isPublished);
    setDisplayOrder(video.displayOrder || 1);
    setCustomThumbnailUrl(video.customThumbnailUrl || null);
    setInstagramSourceUrl(video.instagramSourceUrl || '');
    setUploadProgress(0);
    setUploadStage('idle');
    setUploadError(null);
    setModalOpen(true);
  };

  // Handle Custom Thumbnail Upload
  const handleCustomThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumb(true);
    try {
      const res = await uploadMediaThumbnail(file);
      if (res?.secureUrl) {
        setCustomThumbnailUrl(res.secureUrl);
        setNotice({ type: 'success', message: 'Custom thumbnail uploaded.' });
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload custom thumbnail');
    } finally {
      setIsUploadingThumb(false);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    const finalCategory = category === 'other' ? customCategory.trim() : category;
    if (!title.trim()) {
      setUploadError('Please enter a video title.');
      return;
    }
    if (!finalCategory) {
      setUploadError('Please select or specify a category.');
      return;
    }

    // Editing existing metadata only
    if (editingVideo && !selectedFile) {
      startTransition(async () => {
        try {
          const updateInput: UpdateVideoInput = {
            title: title.trim(),
            description: description.trim(),
            category: finalCategory,
            isPublished,
            displayOrder,
            customThumbnailUrl,
            instagramSourceUrl: instagramSourceUrl.trim() || null,
          };
          const updated = await updateVideoRecord(editingVideo._id || editingVideo.id!, updateInput);
          setVideos((prev) => prev.map((v) => (v._id === updated._id ? updated : v)));
          setNotice({ type: 'success', message: `"${updated.title}" updated successfully.` });
          setModalOpen(false);
        } catch (err) {
          setUploadError(err instanceof Error ? err.message : 'Failed to update video');
        }
      });
      return;
    }

    // New upload or file replacement requires a selected file
    if (!selectedFile) {
      setUploadError('Please select a video file to upload.');
      return;
    }

    // Execute Cloudinary Direct Upload
    try {
      setUploadStage('signing');
      setUploadProgress(5);

      // 1. Request signed parameters from backend
      const signatureData = await getVideoUploadSignature();

      // 2. Upload file directly to Cloudinary with real progress tracking
      setUploadStage('uploading');
      let uploadResult;
      try {
        uploadResult = await uploadVideoDirectToCloudinary(selectedFile, signatureData, (pct) => {
          setUploadProgress(Math.max(5, Math.min(95, pct)));
        });
      } catch (directErr) {
        // Fallback to server upload if direct upload fails
        console.warn('Direct upload failed, attempting server fallback...', directErr);
        uploadResult = await uploadVideoFallback(selectedFile, (pct) => {
          setUploadProgress(Math.max(5, Math.min(95, pct)));
        });
      }

      setUploadProgress(98);
      setUploadStage('saving');

      // 3. Save or replace in MongoDB
      if (replacingVideo) {
        const replaceInput: ReplaceVideoInput = {
          cloudinaryPublicId: uploadResult.publicId,
          cloudinaryAssetId: uploadResult.assetId,
          videoUrl: uploadResult.secureUrl,
          duration: uploadResult.duration || fileMetadata?.duration || 0,
          format: uploadResult.format,
          width: uploadResult.width || fileMetadata?.width || 1280,
          height: uploadResult.height || fileMetadata?.height || 720,
          fileSize: uploadResult.bytes || selectedFile.size,
        };
        const updated = await replaceVideoFile(replacingVideo._id || replacingVideo.id!, replaceInput);
        setVideos((prev) => prev.map((v) => (v._id === updated._id ? updated : v)));
        setNotice({ type: 'success', message: `Video file replaced for "${updated.title}".` });
      } else {
        const createInput: CreateVideoInput = {
          title: title.trim(),
          description: description.trim(),
          cloudinaryPublicId: uploadResult.publicId,
          cloudinaryAssetId: uploadResult.assetId,
          videoUrl: uploadResult.secureUrl,
          customThumbnailUrl: customThumbnailUrl || undefined,
          duration: uploadResult.duration || fileMetadata?.duration || 0,
          format: uploadResult.format,
          width: uploadResult.width || fileMetadata?.width || 1280,
          height: uploadResult.height || fileMetadata?.height || 720,
          fileSize: uploadResult.bytes || selectedFile.size,
          category: finalCategory,
          isPublished,
          displayOrder,
          instagramSourceUrl: instagramSourceUrl.trim() || undefined,
        };
        const created = await createVideoRecord(createInput);
        setVideos((prev) => [created, ...prev]);
        setTotal((prev) => prev + 1);
        setNotice({
          type: 'success',
          message: `Video "${created.title}" uploaded & thumbnail auto-generated!`,
        });
      }

      setUploadProgress(100);
      setUploadStage('complete');
      setModalOpen(false);
    } catch (err) {
      setUploadStage('error');
      setUploadError(err instanceof Error ? err.message : 'Video upload failed. Please try again.');
    }
  };

  // Toggle Publish / Unpublish
  const handleTogglePublish = (video: NativeVideo) => {
    startTransition(async () => {
      try {
        const nextState = !video.isPublished;
        const updated = await toggleVideoPublish(video._id || video.id!, nextState);
        setVideos((prev) => prev.map((v) => (v._id === updated._id ? updated : v)));
        setNotice({
          type: 'success',
          message: `"${video.title}" is now ${nextState ? 'Published' : 'saved as Draft'}.`,
        });
      } catch (err) {
        setNotice({
          type: 'error',
          message: err instanceof Error ? err.message : 'Could not change publish status.',
        });
      }
    });
  };

  // Delete Video
  const handleDelete = (video: NativeVideo) => {
    if (!confirm(`Are you sure you want to delete "${video.title}"? This permanently removes the Cloudinary video and thumbnail.`)) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteVideo(video._id || video.id!);
        setVideos((prev) => prev.filter((v) => v._id !== video._id));
        setTotal((prev) => Math.max(0, prev - 1));
        setNotice({ type: 'success', message: `"${video.title}" and Cloudinary assets deleted successfully.` });
      } catch (err) {
        setNotice({
          type: 'error',
          message: err instanceof Error ? err.message : 'Could not delete video.',
        });
      }
    });
  };

  // Thumbnail Regeneration Submit
  const handleRegenerateThumbnail = async () => {
    if (!thumbnailModalVideo) return;
    setIsRegenerating(true);
    try {
      const updated = await regenerateVideoThumbnail(thumbnailModalVideo._id || thumbnailModalVideo.id!, regenOffset);
      setVideos((prev) => prev.map((v) => (v._id === updated._id ? updated : v)));
      setNotice({ type: 'success', message: `Thumbnail regenerated from frame at ${regenOffset}s!` });
      setThumbnailModalVideo(null);
    } catch (err) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to regenerate thumbnail',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const totalPages = Math.ceil(total / 20) || 1;
  const publishedCount = videos.filter((v) => v.isPublished).length;
  const draftCount = total - publishedCount;

  return (
    <div className="space-y-4">
      {/* ── Notice Banner ─────────────────────────────────────────────── */}
      {notice && (
        <div
          className={`px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-between shadow-2xs transition-all ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
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
        <div className="bg-white rounded-xl border border-[#E3E9E5] p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#66766D] uppercase tracking-wider">Total Videos</span>
            <p className="text-xl font-extrabold text-[#14261D] mt-0.5">{total}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#E3F2EA] text-[#0F6B47] flex items-center justify-center">
            <Film className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E3E9E5] p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#66766D] uppercase tracking-wider">Published</span>
            <p className="text-xl font-extrabold text-emerald-700 mt-0.5">{publishedCount}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E3E9E5] p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#66766D] uppercase tracking-wider">Drafts</span>
            <p className="text-xl font-extrabold text-amber-700 mt-0.5">{draftCount}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E3E9E5] p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#66766D] uppercase tracking-wider">CDN Storage</span>
            <p className="text-xs font-bold text-[#0F6B47] mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Cloudinary Active</span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#0F6B47]/10 text-[#0F6B47] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ── Toolbar: Action, Search & Filters ────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#E3E9E5] p-3 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Upload Button */}
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F5638] hover:bg-[#15734B] text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Native Video</span>
          </button>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Search videos by title or category…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                loadVideos(1, e.target.value, statusFilter, categoryFilter);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              const val = e.target.value as 'all' | 'published' | 'draft';
              setStatusFilter(val);
              loadVideos(1, search, val, categoryFilter);
            }}
            aria-label="Filter by publish status"
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              loadVideos(1, search, statusFilter, e.target.value);
            }}
            aria-label="Filter by category"
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
          >
            <option value="all">All Categories</option>
            {POPULAR_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => loadVideos()}
            disabled={loading}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Video Listing Table ────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#E3E9E5] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <Loader2 className="w-8 h-8 text-[#0F6B47] animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading videos from Cloudinary &amp; MongoDB…</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="py-20 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-full bg-[#E3F2EA] text-[#0F6B47] flex items-center justify-center mx-auto">
              <FileVideo className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Videos Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'No videos match your active filter criteria.'
                : 'Upload your first culinary video to showcase on the customer storefront with automatic thumbnails and direct on-site playback.'}
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F5638] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Video Now</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E3E9E5] bg-[#F7FAF8] text-[#66766D] font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3.5 min-w-[240px]">Video &amp; Thumbnail</th>
                  <th className="py-3 px-3 min-w-[120px]">Category</th>
                  <th className="py-3 px-3 min-w-[80px]">Duration</th>
                  <th className="py-3 px-3 min-w-[100px]">Format &amp; Size</th>
                  <th className="py-3 px-3 min-w-[110px]">Status</th>
                  <th className="py-3 px-3 min-w-[95px]">Date</th>
                  <th className="py-3 px-3.5 text-right min-w-[160px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E9E5] text-[#14261D]">
                {videos.map((vid) => {
                  const thumb = vid.customThumbnailUrl || vid.thumbnailUrl;
                  const sizeMB = vid.fileSize ? (vid.fileSize / (1024 * 1024)).toFixed(1) : null;

                  return (
                    <tr
                      key={vid._id || vid.id}
                      className="hover:bg-[#F7FAF8] transition group"
                    >
                      {/* Video & Thumbnail */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => setPreviewVideo(vid)}
                            className="relative w-24 h-14 rounded-lg overflow-hidden bg-stone-900 shrink-0 border border-stone-200/80 cursor-pointer group/thumb shadow-xs"
                            title="Click to preview video"
                          >
                            {thumb ? (
                              <Image
                                src={thumb}
                                alt={vid.title}
                                fill
                                className="object-cover transition-transform group-hover/thumb:scale-105"
                                sizes="96px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-600">
                                <Video className="w-4 h-4" />
                              </div>
                            )}

                            {/* Hover Play Button */}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition text-white">
                              <Play className="w-4 h-4 fill-white" />
                            </div>

                            {/* Duration Badge */}
                            {vid.durationFormatted && (
                              <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/85 text-[9px] font-mono font-bold text-white">
                                {vid.durationFormatted}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 max-w-sm">
                            <p
                              onClick={() => setPreviewVideo(vid)}
                              className="font-bold text-slate-900 truncate hover:text-[#0F5638] cursor-pointer"
                              title={vid.title}
                            >
                              {vid.title}
                            </p>
                            {vid.description && (
                              <p className="text-[11px] text-[#66766D] truncate mt-0.5">
                                {vid.description}
                              </p>
                            )}
                            {vid.instagramSourceUrl && (
                              <a
                                href={vid.instagramSourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-pink-600 hover:text-pink-700 mt-0.5 font-medium"
                              >
                                <span>Instagram Source</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-full bg-[#E3F2EA] text-[#0F6B47] text-[11px] font-bold">
                          {vid.category}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-3 font-mono font-semibold text-[#14261D]">
                        {vid.durationFormatted || '00:00'}
                      </td>

                      {/* Format & Dimensions */}
                      <td className="py-3 px-3 text-[#66766D] font-mono text-[11px]">
                        <div>{vid.format.toUpperCase()} &bull; {vid.width}&times;{vid.height}</div>
                        {sizeMB && <div className="text-[10px] text-stone-400">{sizeMB} MB</div>}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(vid)}
                          disabled={isPending}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition cursor-pointer ${
                            vid.isPublished
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${vid.isPublished ? 'bg-emerald-600' : 'bg-amber-500'}`} />
                          <span>{vid.isPublished ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-[#66766D] font-mono text-[11px] whitespace-nowrap">
                        {new Date(vid.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Play / Preview */}
                          <button
                            type="button"
                            onClick={() => setPreviewVideo(vid)}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#14261D] transition cursor-pointer"
                            title="Play Native Video"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>

                          {/* Regenerate Thumbnail */}
                          <button
                            type="button"
                            onClick={() => {
                              setThumbnailModalVideo(vid);
                              setRegenOffset(1);
                            }}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#14261D] transition cursor-pointer"
                            title="Regenerate automatic thumbnail from video frame"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Metadata */}
                          <button
                            type="button"
                            onClick={() => openEditModal(vid)}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#14261D] transition cursor-pointer"
                            title="Edit Title &amp; Details"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Replace Video File */}
                          <button
                            type="button"
                            onClick={() => openReplaceModal(vid)}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-amber-700 transition cursor-pointer"
                            title="Replace Video File"
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Video */}
                          <button
                            type="button"
                            onClick={() => handleDelete(vid)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                            title="Delete Video"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-[#E3E9E5] bg-[#F7FAF8] flex items-center justify-between text-xs text-[#66766D]">
            <span>
              Page {page} of {totalPages} &bull; {total} total videos
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => loadVideos(page - 1)}
                disabled={page <= 1}
                className="px-2.5 py-1 rounded bg-white border border-[#E3E9E5] font-semibold hover:bg-stone-50 disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => loadVideos(page + 1)}
                disabled={page >= totalPages}
                className="px-2.5 py-1 rounded bg-white border border-[#E3E9E5] font-semibold hover:bg-stone-50 disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Upload & Edit Modal ────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => {
            if (uploadStage === 'uploading' || uploadStage === 'saving') return;
            setModalOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-stone-200 bg-[#FBF9F5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E3F2EA] text-[#0F6B47] flex items-center justify-center">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#14261D] text-sm sm:text-base">
                    {replacingVideo
                      ? `Replace Video File: ${replacingVideo.title}`
                      : editingVideo
                      ? `Edit Video: ${editingVideo.title}`
                      : 'Upload New Culinary Video'}
                  </h3>
                  <p className="text-[11px] text-[#66766D]">
                    Direct Cloudinary upload &bull; Auto-generated thumbnails &bull; On-site HTML5 playback
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (uploadStage === 'uploading' || uploadStage === 'saving') return;
                  setModalOpen(false);
                }}
                disabled={uploadStage === 'uploading' || uploadStage === 'saving'}
                className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 transition cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form
              id="video-upload-form"
              onSubmit={handleSubmit}
              className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs"
            >
              {/* Error Message */}
              {uploadError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Upload Dropzone (Show if new video or replacing video file) */}
              {(!editingVideo || replacingVideo) && (
                <div className="space-y-2">
                  <label className="block font-bold text-[#14261D]">
                    Video File <span className="text-red-500">*</span>
                  </label>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-[#0F5638] bg-[#E3F2EA]/40'
                        : selectedFile
                        ? 'border-emerald-400 bg-emerald-50/30'
                        : 'border-stone-300 hover:border-[#0F5638] bg-stone-50/50 hover:bg-stone-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                      }}
                      className="hidden"
                    />

                    {selectedFile ? (
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 text-sm truncate max-w-sm mx-auto">
                            {selectedFile.name}
                          </p>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                            {fileMetadata && ` &bull; ${fileMetadata.width}×${fileMetadata.height} &bull; ${Math.round(fileMetadata.duration)}s`}
                          </p>
                        </div>
                        <p className="text-[10px] text-emerald-700 font-semibold">
                          Click or drag another file to replace
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-full bg-[#E3F2EA] text-[#0F6B47] flex items-center justify-center mx-auto">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-stone-800 text-sm">
                            Drag &amp; drop video file here, or click to browse
                          </p>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Supported: MP4, WebM, MOV &bull; Maximum size: 100MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Local Video Pre-Upload Player Preview */}
                  {localFilePreviewUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-stone-200 bg-black aspect-video max-h-48 mx-auto">
                      <video
                        src={localFilePreviewUrl}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Upload Progress Bar */}
              {(uploadStage === 'uploading' || uploadStage === 'saving' || uploadStage === 'signing') && (
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between font-bold text-emerald-900 text-xs">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                      <span>
                        {uploadStage === 'signing'
                          ? 'Generating secure Cloudinary signature…'
                          : uploadStage === 'uploading'
                          ? `Uploading directly to Cloudinary (${uploadProgress}%)…`
                          : 'Extracting thumbnail & saving video record in MongoDB…'}
                      </span>
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-emerald-200 overflow-hidden">
                    <div
                      className="h-full bg-[#0F5638] transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Title Field */}
              {!replacingVideo && (
                <div className="space-y-1">
                  <label className="block font-bold text-[#14261D]">
                    Video Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Crispy Restaurant-Style Broasted Chicken Masterclass"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:border-[#0F5638]"
                  />
                </div>
              )}

              {/* Description Field */}
              {!replacingVideo && (
                <div className="space-y-1">
                  <label className="block font-bold text-[#14261D]">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter detailed cooking steps, marination time, secret spices, or tips…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:border-[#0F5638]"
                  />
                </div>
              )}

              {/* Category & Display Order Grid */}
              {!replacingVideo && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-[#14261D]">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#0F5638]"
                    >
                      {POPULAR_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="other">Custom Category…</option>
                    </select>

                    {category === 'other' && (
                      <input
                        type="text"
                        required
                        placeholder="Enter custom category name"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full mt-1.5 px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:border-[#0F5638]"
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-[#14261D]">
                      Display Order (Sort Priority)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-mono focus:outline-none focus:border-[#0F5638]"
                    />
                  </div>
                </div>
              )}

              {/* Custom Thumbnail Override Option */}
              {!replacingVideo && (
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-stone-800 block">Thumbnail &amp; Poster</span>
                      <span className="text-[11px] text-stone-500 block">
                        Cloudinary automatically extracts a frame from the video. You can also upload a custom image poster if preferred.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => thumbInputRef.current?.click()}
                      disabled={isUploadingThumb}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 font-semibold hover:bg-stone-100 transition cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {isUploadingThumb ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ImageIcon className="w-3.5 h-3.5 text-[#0F6B47]" />
                      )}
                      <span>Upload Custom Image</span>
                    </button>
                    <input
                      ref={thumbInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleCustomThumbnailUpload}
                      className="hidden"
                    />
                  </div>

                  {customThumbnailUrl && (
                    <div className="flex items-center gap-2 pt-1">
                      <div className="relative w-16 h-10 rounded overflow-hidden border border-stone-200">
                        <Image src={customThumbnailUrl} alt="Thumbnail preview" fill className="object-cover" />
                      </div>
                      <span className="text-emerald-700 font-semibold text-[11px]">
                        Custom thumbnail applied
                      </span>
                      <button
                        type="button"
                        onClick={() => setCustomThumbnailUrl(null)}
                        className="text-stone-400 hover:text-red-600 transition ml-auto"
                        title="Remove custom thumbnail and use automatic frame"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Instagram Reference Link (Requirement 12) */}
              {!replacingVideo && (
                <div className="p-3 rounded-xl bg-pink-50/50 border border-pink-200/70 space-y-1">
                  <label className="block font-bold text-pink-900">
                    Instagram Reference URL <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <p className="text-[10px] text-pink-800">
                    Videos are streamed directly on Yumnest via Cloudinary. If this video was originally published on Instagram, paste the Reel link here as an optional source reference.
                  </p>
                  <input
                    type="url"
                    placeholder="https://www.instagram.com/reel/C7abc..."
                    value={instagramSourceUrl}
                    onChange={(e) => setInstagramSourceUrl(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-pink-200 bg-white text-xs focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>
              )}

              {/* Published Toggle */}
              {!replacingVideo && (
                <div className="pt-2 flex items-center justify-between border-t border-stone-200">
                  <div>
                    <span className="font-bold text-[#14261D] block">Publish Immediately</span>
                    <span className="text-[11px] text-[#66766D] block">
                      Published videos appear immediately in customer video carousels and masterclass galleries.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F5638]" />
                  </label>
                </div>
              )}
            </form>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-stone-200 bg-[#FBF9F5] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={uploadStage === 'uploading' || uploadStage === 'saving'}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="video-upload-form"
                disabled={
                  uploadStage === 'signing' ||
                  uploadStage === 'uploading' ||
                  uploadStage === 'saving' ||
                  isUploadingThumb ||
                  isPending
                }
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0F5638] hover:bg-[#15734B] text-white font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {(uploadStage === 'signing' ||
                  uploadStage === 'uploading' ||
                  uploadStage === 'saving' ||
                  isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {replacingVideo
                    ? 'Upload & Replace Video'
                    : editingVideo
                    ? 'Save Video Details'
                    : 'Upload & Publish Video'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Regenerate Thumbnail Modal ─────────────────────────────────── */}
      {thumbnailModalVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setThumbnailModalVideo(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#0F6B47]" />
                <h4 className="font-bold text-[#14261D] text-sm">
                  Regenerate Automatic Thumbnail
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setThumbnailModalVideo(null)}
                className="p-1 rounded text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#66766D] leading-relaxed">
              Cloudinary will extract an optimized frame from <b>&ldquo;{thumbnailModalVideo.title}&rdquo;</b> at the specified second offset.
            </p>

            <div className="space-y-1.5">
              <label className="block font-bold text-xs text-[#14261D]">
                Capture Frame At (Seconds):
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 5].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setRegenOffset(sec)}
                    className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      regenOffset === sec
                        ? 'bg-[#0F5638] text-white border-[#0F5638]'
                        : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-800'
                    }`}
                  >
                    {sec}s offset
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setThumbnailModalVideo(null)}
                className="px-3.5 py-1.5 rounded-lg border border-stone-200 text-stone-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegenerateThumbnail}
                disabled={isRegenerating}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0F5638] hover:bg-[#15734B] text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {isRegenerating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Regenerate Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Native Video Playback Modal (Admin Preview) ────────────────── */}
      {previewVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewVideo(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-4xl bg-stone-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-stone-800 flex flex-col max-h-[95vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 bg-stone-900 border-b border-stone-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 truncate mr-3">
                <span className="px-2.5 py-0.5 rounded-full bg-[#0F5638] text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-100">
                  {previewVideo.category}
                </span>
                <span className="font-semibold text-xs sm:text-sm text-stone-200 truncate">
                  {previewVideo.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVideo(null)}
                className="p-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full bg-black">
              <NativeVideoPlayer
                videoUrl={previewVideo.videoUrl}
                posterUrl={previewVideo.customThumbnailUrl || previewVideo.thumbnailUrl}
                title={previewVideo.title}
                autoPlay={true}
                aspectRatio={previewVideo.height > previewVideo.width ? '9/16' : '16/9'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
