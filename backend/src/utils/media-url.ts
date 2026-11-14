/**
 * Media URL parsing, validation, and ID extraction utilities
 * for YouTube Videos and Instagram Reels.
 */

export interface ParsedYouTubeMedia {
  platform: "youtube";
  externalId: string;
  normalizedUrl: string;
  embedUrl: string;
  defaultThumbnailUrl: string;
}

export interface ParsedInstagramMedia {
  platform: "instagram";
  externalId: string;
  normalizedUrl: string;
  embedUrl: string;
  defaultThumbnailUrl: string;
}

export type ParsedMediaResult = ParsedYouTubeMedia | ParsedInstagramMedia;

function normalizeRawUrl(raw: string): string {
  if (!raw || typeof raw !== "string") return "";
  let trimmed = raw.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = "https://" + trimmed;
  }
  return trimmed;
}

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

const INSTAGRAM_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
  "m.instagram.com",
  "instagr.am",
  "www.instagr.am",
]);

export function parseYouTubeUrl(rawUrl: string): ParsedYouTubeMedia | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();

  // If a raw 11-character video ID is passed directly
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return {
      platform: "youtube",
      externalId: trimmed,
      normalizedUrl: `https://www.youtube.com/watch?v=${trimmed}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${trimmed}`,
      defaultThumbnailUrl: `https://img.youtube.com/vi/${trimmed}/hqdefault.jpg`,
    };
  }

  const normalized = normalizeRawUrl(trimmed);
  try {
    const urlObj = new URL(normalized);
    const hostname = urlObj.hostname.toLowerCase();
    if (!YOUTUBE_HOSTS.has(hostname)) return null;

    let videoId: string | null = null;

    if (hostname === "youtu.be") {
      const parts = urlObj.pathname.split("/").filter(Boolean);
      if (parts.length > 0 && /^[a-zA-Z0-9_-]{11}$/.test(parts[0])) {
        videoId = parts[0];
      }
    } else {
      if (urlObj.pathname === "/watch") {
        const v = urlObj.searchParams.get("v");
        if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
          videoId = v;
        }
      } else if (
        urlObj.pathname.startsWith("/shorts/") ||
        urlObj.pathname.startsWith("/embed/") ||
        urlObj.pathname.startsWith("/live/") ||
        urlObj.pathname.startsWith("/v/")
      ) {
        const parts = urlObj.pathname.split("/").filter(Boolean);
        if (parts.length >= 2 && /^[a-zA-Z0-9_-]{11}$/.test(parts[1])) {
          videoId = parts[1];
        }
      }
    }

    if (!videoId) {
      const match = trimmed.match(
        /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/i
      );
      if (match && match[1]) {
        videoId = match[1];
      }
    }

    if (!videoId) return null;

    return {
      platform: "youtube",
      externalId: videoId,
      normalizedUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      defaultThumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  } catch {
    return null;
  }
}

export function parseInstagramUrl(rawUrl: string): ParsedInstagramMedia | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  const normalized = normalizeRawUrl(trimmed);

  try {
    const urlObj = new URL(normalized);
    const hostname = urlObj.hostname.toLowerCase();
    if (!INSTAGRAM_HOSTS.has(hostname)) return null;

    let reelId: string | null = null;
    const parts = urlObj.pathname.split("/").filter(Boolean);

    // Matches /reel/REEL_ID, /reels/REEL_ID, /p/POST_ID, /tv/TV_ID
    for (let i = 0; i < parts.length; i++) {
      if (["reel", "reels", "p", "tv"].includes(parts[i].toLowerCase()) && parts[i + 1]) {
        const candidate = parts[i + 1];
        if (/^[a-zA-Z0-9_-]+$/.test(candidate)) {
          reelId = candidate;
          break;
        }
      }
    }

    if (!reelId) {
      const match = trimmed.match(/(?:instagram\.com|instagr\.am)\/(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/i);
      if (match && match[1]) {
        reelId = match[1];
      }
    }

    if (!reelId) return null;

    return {
      platform: "instagram",
      externalId: reelId,
      normalizedUrl: `https://www.instagram.com/reel/${reelId}/`,
      embedUrl: `https://www.instagram.com/reel/${reelId}/embed`,
      defaultThumbnailUrl: "/assets/instagram-reel-placeholder.png",
    };
  } catch {
    return null;
  }
}

export function parseAndValidateMediaUrl(
  platform: "youtube" | "instagram" | "native",
  url: string
): ParsedMediaResult | null {
  if (platform === "youtube") {
    return parseYouTubeUrl(url);
  }
  if (platform === "instagram") {
    return parseInstagramUrl(url);
  }
  return null;
}

