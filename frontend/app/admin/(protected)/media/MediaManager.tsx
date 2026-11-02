'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import {
  Upload,
  Images,
  Trash2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { fetchMedia, uploadMedia, deleteMedia } from '@/lib/api/media';
import type { MediaItem } from '@/types/api';

interface MediaManagerProps {
  initialMedia: MediaItem[];
  initialTotal: number;
}

export function MediaManager({ initialMedia, initialTotal }: MediaManagerProps) {
  const [items, setItems] = useState<MediaItem[]>(initialMedia);
  const [total, setTotal] = useState(initialTotal);
  const [folderFilter, setFolderFilter] = useState<'all' | 'products' | 'categories'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadFolder, setUploadFolder] = useState<'products' | 'categories'>('products');
  const [altText, setAltText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Notice banner
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async (folder = folderFilter) => {
    setIsLoading(true);
    try {
      const folderParam = folder === 'all' ? undefined : folder;
      const res = await fetchMedia({ limit: 24, folder: folderParam });
      setItems(res.data);
      if (res.meta) setTotal(res.meta.total);
    } catch (err) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to load media assets.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      setUploadError('Please select at least one image file.');
      return;
    }

    if (selectedFiles.length > 10) {
      setUploadError('You can upload a maximum of 10 files at once.');
      return;
    }

    setUploadError(null);

    const formData = new FormData();
    Array.from(selectedFiles).forEach((f) => {
      formData.append('files', f);
    });
    formData.append('folder', uploadFolder);
    if (altText.trim()) formData.append('altText', altText.trim());

    startTransition(async () => {
      try {
        const uploaded = await uploadMedia(formData);
        setItems((prev) => [...uploaded, ...prev]);
        setTotal((prev) => prev + uploaded.length);
        setNotice({ type: 'success', message: `${uploaded.length} image(s) uploaded successfully.` });
        setUploadModalOpen(false);
        setSelectedFiles(null);
        setAltText('');
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Media upload failed.');
      }
    });
  };

  const handleDelete = (item: MediaItem) => {
    if (!confirm(`Are you sure you want to delete "${item.originalFilename}"? If referenced by any product or category, deletion will be blocked.`)) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteMedia(item._id);
        setItems((prev) => prev.filter((i) => i._id !== item._id));
        setTotal((prev) => Math.max(0, prev - 1));
        setNotice({ type: 'success', message: `Image "${item.originalFilename}" was deleted.` });
      } catch (err) {
        setNotice({
          type: 'error',
          message: err instanceof Error ? err.message : 'Could not delete media asset.',
        });
      }
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Toolbar: Folder Tabs + Upload Button ───────────────────────── */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-xs font-medium w-full sm:w-auto">
          {(['all', 'products', 'categories'] as const).map((folder) => (
            <button
              key={folder}
              type="button"
              onClick={() => {
                setFolderFilter(folder);
                loadData(folder);
              }}
              className={`capitalize px-3 py-1 rounded transition ${
                folderFilter === folder
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {folder}
            </button>
          ))}
          <span className="text-[11px] text-slate-500 font-medium px-2 hidden md:inline">
            {total} {total === 1 ? 'asset' : 'assets'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setUploadError(null);
            setUploadModalOpen(true);
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs font-semibold shadow-2xs transition"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload images</span>
        </button>
      </div>

      {/* ── Media Grid ────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-xs text-slate-500 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span>Loading assets...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
            <Images className="w-4 h-4" />
          </div>
          <p className="font-semibold text-slate-700">No media assets in this folder</p>
          <p className="text-slate-400">Upload product photos or category banners to Cloudinary.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="group bg-white rounded-lg border border-slate-200/80 overflow-hidden shadow-2xs hover:border-slate-300 transition flex flex-col"
            >
              <div className="aspect-square bg-slate-100 relative overflow-hidden">
                <Image
                  src={item.secureUrl}
                  alt={item.altText || item.originalFilename}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-200"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
                <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[9px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wider">
                  {item.folder}
                </span>
              </div>

              <div className="p-2.5 text-xs flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <p className="font-semibold text-slate-800 truncate text-[11px]" title={item.originalFilename}>
                    {item.originalFilename}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {item.width}×{item.height} · {formatBytes(item.bytes)}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-slate-500">
                  <button
                    type="button"
                    onClick={() => handleCopy(item.secureUrl, item._id)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium hover:text-[#0F5638]"
                    title="Copy Image URL"
                  >
                    {copiedId === item._id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete image"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <span className="text-[11px] text-slate-500 font-medium px-2 hidden md:inline">
            {total} {total === 1 ? 'asset' : 'assets'}
          </span>
        </div>
      )}

      {/* ── Upload Modal ──────────────────────────────────────────────── */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
          <div className="w-full max-w-md bg-white rounded-lg border border-slate-200 shadow-xl p-5 text-xs space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">Upload Media Assets</h3>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadError && (
              <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Folder *
                </label>
                <select
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value as 'products' | 'categories')}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                >
                  <option value="products">products (for item photography)</option>
                  <option value="categories">categories (for taxonomy banners)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Image Files * (Max 10 files, up to 5MB each)
                </label>
                <input
                  type="file"
                  required
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  className="w-full px-2 py-1.5 rounded-md border border-slate-200 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alt Text (optional description)
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="e.g. Tellicherry black pepper harvest photo"
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#0F5638] hover:bg-[#187A4F] text-white font-semibold shadow-2xs transition disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isPending ? 'Uploading…' : 'Upload to Cloudinary'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
