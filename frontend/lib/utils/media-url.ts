/**
 * Frontend media URL parsing and instant preview utilities.
 */

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

const INSTAGRAM_HOSTS = new Set([
  'instagram.com',
  'www.instagram.com',
]);

export interface MediaPreviewResult {
  isValid: boolean;
  externalId?: string;
  defaultThumbnailUrl?: string;
  error?: string;
}

export function parseYouTubeVideoId(rawUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  try {
    const trimmed = rawUrl.trim();
    const urlObj = new URL(trimmed);
    const hostname = urlObj.hostname.toLowerCase();

    if (!YOUTUBE_HOSTS.has(hostname)) return null;

    if (hostname === 'youtu.be') {
      const parts = urlObj.pathname.split('/').filter(Boolean);
      if (parts.length > 0 && /^[a-zA-Z0-9_-]{11}$/.test(parts[0])) {
        return parts[0];
      }
    } else {
      if (urlObj.pathname === '/watch') {
        const v = urlObj.searchParams.get('v');
        if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      } else if (urlObj.pathname.startsWith('/shorts/') || urlObj.pathname.startsWith('/embed/')) {
        const parts = urlObj.pathname.split('/').filter(Boolean);
        if (parts.length >= 2 && /^[a-zA-Z0-9_-]{11}$/.test(parts[1])) {
          return parts[1];
        }
      }
    }

    const match = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export function parseInstagramReelId(rawUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  try {
    const trimmed = rawUrl.trim();
    const urlObj = new URL(trimmed);
    const hostname = urlObj.hostname.toLowerCase();

    if (!INSTAGRAM_HOSTS.has(hostname)) return null;

    const parts = urlObj.pathname.split('/').filter(Boolean);
    if (parts.length >= 2 && (parts[0] === 'reel' || parts[0] === 'p' || parts[0] === 'reels')) {
      const candidate = parts[1];
      if (/^[a-zA-Z0-9_-]+$/.test(candidate)) return candidate;
    }

    const match = trimmed.match(/instagram\.com\/(?:reel|reels|p)\/([a-zA-Z0-9_-]+)/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export function detectPlatformFromUrl(rawUrl: string): 'youtube' | 'instagram' | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const lower = rawUrl.toLowerCase().trim();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('instagram.com') || lower.includes('instagr.am')) return 'instagram';
  return null;
}

export async function fetchFastYouTubeOembed(videoId: string): Promise<{
  title?: string;
  authorName?: string;
  thumbnailUrl?: string;
} | null> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title || undefined,
      authorName: data.author_name || undefined,
      thumbnailUrl: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  } catch {
    return null;
  }
}

export function getMediaLivePreview(
  platform: 'youtube' | 'instagram',
  url: string,
  customThumbnail?: string
): MediaPreviewResult {
  if (!url || !url.trim()) {
    return { isValid: false };
  }

  if (platform === 'youtube') {
    const videoId = parseYouTubeVideoId(url);
    if (!videoId) {
      return {
        isValid: false,
        error: 'Invalid YouTube URL. Use youtube.com/watch?v=..., youtu.be/..., or shorts/...',
      };
    }
    return {
      isValid: true,
      externalId: videoId,
      defaultThumbnailUrl: customThumbnail?.trim() || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  if (platform === 'instagram') {
    const reelId = parseInstagramReelId(url);
    if (!reelId) {
      return {
        isValid: false,
        error: 'Invalid Instagram URL. Use instagram.com/reel/REEL_ID/ or /p/POST_ID/',
      };
    }
    return {
      isValid: true,
      externalId: reelId,
      defaultThumbnailUrl: customThumbnail?.trim() || undefined,
    };
  }

  return { isValid: false };
}

