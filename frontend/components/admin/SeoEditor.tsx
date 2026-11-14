'use client';

import React, { useState } from 'react';
import {
  Globe,
  Smartphone,
  Monitor,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface SeoFormState {
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  secondaryKeywords?: string[];
  slug?: string;
  canonicalUrl?: string;
  isNoIndex?: boolean;
  ogImage?: string;
}

interface SeoEditorProps {
  entityType: 'product' | 'category';
  defaultName: string;
  defaultDescription: string;
  slug: string;
  onSlugChange?: (slug: string) => void;
  seoData: SeoFormState;
  onChange: (updated: Partial<SeoFormState>) => void;
  existingItems?: Array<{ id?: string; name: string; slug?: string; seoTitle?: string; seoDescription?: string }>;
  currentId?: string;
}

export const SeoEditor: React.FC<SeoEditorProps> = ({
  entityType,
  defaultName,
  defaultDescription,
  slug,
  onSlugChange,
  seoData,
  onChange,
  existingItems = [],
  currentId,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [secKeywordInput, setSecKeywordInput] = useState('');

  const displayTitle = seoData.seoTitle?.trim() || `${defaultName || 'Untitled'} | Yum Nest`;
  const displayDesc = seoData.seoDescription?.trim() || defaultDescription?.trim() || 'Experience authentic Kerala spices and foods from Yum Nest.';
  const displaySlug = (slug || seoData.slug || '').trim();
  const displayUrl = `https://yumnest.in/${entityType === 'product' ? 'products' : 'categories'}/${displaySlug || 'item-slug'}`;

  // Character counts
  const titleLen = (seoData.seoTitle || '').length;
  const descLen = (seoData.seoDescription || '').length;

  // Duplicate checks against existing items
  const duplicateTitle = seoData.seoTitle?.trim()
    ? existingItems.find(
        (item) =>
          item.id !== currentId &&
          item.seoTitle &&
          item.seoTitle.trim().toLowerCase() === seoData.seoTitle?.trim().toLowerCase()
      )
    : null;

  const duplicateDesc = seoData.seoDescription?.trim()
    ? existingItems.find(
        (item) =>
          item.id !== currentId &&
          item.seoDescription &&
          item.seoDescription.trim().toLowerCase() === seoData.seoDescription?.trim().toLowerCase()
      )
    : null;

  // Slug validation
  const isSlugValid = !slug || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

  // Focus keyword presence
  const focusKw = (seoData.focusKeyword || '').trim().toLowerCase();
  const kwInTitle = focusKw ? displayTitle.toLowerCase().includes(focusKw) : false;
  const kwInDesc = focusKw ? displayDesc.toLowerCase().includes(focusKw) : false;

  // Quality score (out of 100)
  let qualityScore = 30;
  if (titleLen >= 20 && titleLen <= 65) qualityScore += 20;
  if (descLen >= 70 && descLen <= 165) qualityScore += 20;
  if (focusKw) qualityScore += 10;
  if (kwInTitle) qualityScore += 10;
  if (kwInDesc) qualityScore += 10;
  if (seoData.isNoIndex) qualityScore = 0; // Deliberate noindex

  const handleAddSecondaryKeyword = () => {
    if (!secKeywordInput.trim()) return;
    const current = seoData.secondaryKeywords || [];
    if (!current.includes(secKeywordInput.trim())) {
      onChange({ secondaryKeywords: [...current, secKeywordInput.trim()] });
    }
    setSecKeywordInput('');
  };

  const handleRemoveSecondaryKeyword = (kwToRemove: string) => {
    const current = seoData.secondaryKeywords || [];
    onChange({ secondaryKeywords: current.filter((k) => k !== kwToRemove) });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between border-b border-slate-200 transition text-left cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                Google Search &amp; SEO Engine
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  seoData.isNoIndex
                    ? 'bg-amber-100 text-amber-800'
                    : qualityScore >= 80
                    ? 'bg-emerald-100 text-emerald-800'
                    : qualityScore >= 50
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {seoData.isNoIndex ? 'No-Index' : `SEO Score: ${qualityScore}%`}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Control how this {entityType} ranks on Google and appears when shared on social media.
            </p>
          </div>
        </div>
        <div className="text-slate-400">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-5 space-y-5">
          {/* ── 1. Live Google Search Result Preview (SERP Snippet) ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                Live Google SERP Snippet Preview
              </span>
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition ${
                    previewDevice === 'desktop'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Monitor className="w-3 h-3" />
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition ${
                    previewDevice === 'mobile'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  Mobile
                </button>
              </div>
            </div>

            {/* Google SERP Box */}
            <div
              className={`p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-[#FFFFFF] shadow-2xs transition-all ${
                previewDevice === 'mobile' ? 'max-w-sm' : 'w-full'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                  Y
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] text-[#202124] font-medium leading-none">
                    Yum Nest
                  </span>
                  <span className="text-[11px] text-[#4d5156] leading-snug truncate max-w-[280px]">
                    {displayUrl}
                  </span>
                </div>
              </div>
              <h4 className="text-[16px] text-[#1a0dab] hover:underline cursor-pointer font-medium leading-snug line-clamp-1">
                {displayTitle}
              </h4>
              <p className="text-[12px] text-[#4d5156] leading-relaxed line-clamp-2 mt-1">
                {displayDesc}
              </p>
            </div>
          </div>

          {/* ── 2. Warnings & Recommendations ── */}
          {(duplicateTitle || duplicateDesc || !isSlugValid || !focusKw) && (
            <div className="space-y-1.5 p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900 text-xs">
              {!focusKw && (
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Tip: Set a Focus Keyword to target high-intent searches.</span>
                </div>
              )}
              {duplicateTitle && (
                <div className="flex items-center gap-1.5 text-red-700 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>Duplicate SEO Title detected! Matches &quot;{duplicateTitle.name}&quot;.</span>
                </div>
              )}
              {duplicateDesc && (
                <div className="flex items-center gap-1.5 text-red-700 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>Duplicate Meta Description matches &quot;{duplicateDesc.name}&quot;.</span>
                </div>
              )}
              {!isSlugValid && (
                <div className="flex items-center gap-1.5 text-red-700 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>Invalid URL slug format. Use only lowercase letters, numbers, and single hyphens.</span>
                </div>
              )}
            </div>
          )}

          {/* ── 3. SEO Form Controls ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* SEO Title */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 text-xs">
                  SEO Title (Search Headline)
                </label>
                <span
                  className={`text-[10px] font-mono ${
                    titleLen > 65
                      ? 'text-red-600 font-bold'
                      : titleLen >= 40
                      ? 'text-emerald-700 font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  {titleLen} / 60 characters
                </span>
              </div>
              <input
                type="text"
                value={seoData.seoTitle || ''}
                onChange={(e) => onChange({ seoTitle: e.target.value })}
                placeholder={`e.g. ${defaultName} | Buy Online | Yum Nest`}
                className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Recommended 50–60 characters. Appears as the clickable blue title in Google.
              </span>
            </div>

            {/* Meta Description */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 text-xs">
                  Meta Description (Search Snippet)
                </label>
                <span
                  className={`text-[10px] font-mono ${
                    descLen > 165
                      ? 'text-red-600 font-bold'
                      : descLen >= 120
                      ? 'text-emerald-700 font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  {descLen} / 160 characters
                </span>
              </div>
              <textarea
                rows={2}
                value={seoData.seoDescription || ''}
                onChange={(e) => onChange({ seoDescription: e.target.value })}
                placeholder={`e.g. Buy authentic ${defaultName} from Yum Nest. Prepared with 100% natural spices without artificial colors or preservatives.`}
                className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Recommended 130–160 characters. Provide a compelling call-to-action for shoppers.
              </span>
            </div>

            {/* Focus Keyword */}
            <div>
              <label className="block font-semibold text-slate-700 text-xs mb-1">
                Focus Keyword
              </label>
              <input
                type="text"
                value={seoData.focusKeyword || ''}
                onChange={(e) => onChange({ focusKeyword: e.target.value })}
                placeholder="e.g. Broast Masala Powder Kerala"
                className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
              />
              {focusKw && (
                <div className="flex items-center gap-2 mt-1 text-[10px]">
                  <span
                    className={`flex items-center gap-0.5 ${
                      kwInTitle ? 'text-emerald-700 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    {kwInTitle ? <CheckCircle2 className="w-3 h-3" /> : '○'} In Title
                  </span>
                  <span
                    className={`flex items-center gap-0.5 ${
                      kwInDesc ? 'text-emerald-700 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    {kwInDesc ? <CheckCircle2 className="w-3 h-3" /> : '○'} In Description
                  </span>
                </div>
              )}
            </div>

            {/* Canonical URL Override */}
            <div>
              <label className="block font-semibold text-slate-700 text-xs mb-1">
                Canonical URL Override (Optional)
              </label>
              <input
                type="url"
                value={seoData.canonicalUrl || ''}
                onChange={(e) => onChange({ canonicalUrl: e.target.value })}
                placeholder={displayUrl}
                className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Leave blank to auto-use standard canonical URL.
              </span>
            </div>

            {/* Secondary Keywords */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 text-xs mb-1">
                Secondary Keywords
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={secKeywordInput}
                  onChange={(e) => setSecKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSecondaryKeyword();
                    }
                  }}
                  placeholder="Add keyword variant (e.g. Crispy Broast Mix) and press Enter"
                  className="flex-1 px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
                />
                <button
                  type="button"
                  onClick={handleAddSecondaryKeyword}
                  className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  Add
                </button>
              </div>
              {Array.isArray(seoData.secondaryKeywords) && seoData.secondaryKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {seoData.secondaryKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px]"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => handleRemoveSecondaryKeyword(kw)}
                        className="text-slate-400 hover:text-red-600 font-bold ml-0.5"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Open Graph Image */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 text-xs mb-1">
                Custom Social Share Image URL (Open Graph)
              </label>
              <input
                type="text"
                value={seoData.ogImage || ''}
                onChange={(e) => onChange({ ogImage: e.target.value })}
                placeholder="https://... or leave blank for default primary image"
                className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#0F5638]"
              />
            </div>

            {/* Indexing Controls */}
            <div className="sm:col-span-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(seoData.isNoIndex)}
                  onChange={(e) => onChange({ isNoIndex: e.target.checked })}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                />
                <div>
                  <span className="font-semibold text-slate-800 text-xs">
                    Hide from search engines (noindex)
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    Enable this only if this {entityType} is temporary, private, or test content that Google should not index.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
