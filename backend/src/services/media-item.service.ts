import mongoose, { type FilterQuery } from "mongoose";
import { MediaItemModel, type IMediaItem, type MediaPlatform, type MediaStatus } from "../models/media-item.model";
import { parseAndValidateMediaUrl } from "../utils/media-url";
import { HttpError } from "../utils/httpError";
import type {
  MediaItemCreateInput,
  MediaItemUpdateInput,
  MediaItemListQuery,
  MediaFetchMetadataInput,
} from "../validators/media-item.validators";
import { deleteImage, uploadImageFromUrl, isCloudinaryConfigured } from "../config/cloudinary";
import type { Environment } from "../config/env";

const INITIAL_COOKING_VIDEOS: Array<Omit<IMediaItem, "createdAt" | "updatedAt">> = [
  {
    platform: "youtube",
    url: "https://www.youtube.com/watch?v=bXvN_v8vXwE",
    externalId: "bXvN_v8vXwE",
    title: "Restaurant-Style Crispy Broasted Chicken | Yumnest Broast Masala",
    titleMl: "റെസ്റ്റോറന്റ് സ്റ്റൈൽ ക്രിസ്പി ബ്രോസ്റ്റഡ് ചിക്കൻ എളുപ്പത്തിൽ ഉണ്ടാക്കാം",
    description: "Learn how to make authentic restaurant-style crispy broasted chicken at home using Yumnest Broast Masala.",
    descriptionMl: "റസ്റ്റോറന്റ് സ്റ്റൈലിൽ ക്രിസ്പി ബ്രോസ്റ്റഡ് ചിക്കൻ വീട്ടിൽ തന്നെ എളുപ്പത്തിൽ ഉണ്ടാക്കാം.",
    category: "Broast Special",
    thumbnailUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
    duration: "12:45",
    status: "published",
    featured: true,
    displayOrder: 1,
  },
  {
    platform: "youtube",
    url: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
    externalId: "kJQP7kiw5Fk",
    title: "Signature Alfaham Chicken Masala Preparation & Grilling Guide",
    titleMl: "സ്പെഷ്യൽ അൽഫാഹം ചിക്കൻ റെസിപ്പി - പെർഫെക്റ്റ് ഗ്രിൽഡ് ഫ്ലേവർ",
    description: "Step-by-step authentic Alfaham chicken marination and slow-grilling guide with aromatic Malabar spices.",
    descriptionMl: "പെർഫെക്റ്റ് അൽഫാഹം ചിക്കൻ വീട്ടിൽ തയ്യാറാക്കാം സ്പെഷ്യൽ മസാല കൂട്ടിനൊപ്പം.",
    category: "Signature Rubs",
    thumbnailUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80",
    duration: "15:20",
    status: "published",
    featured: true,
    displayOrder: 2,
  },
  {
    platform: "youtube",
    url: "https://www.youtube.com/watch?v=X48VuDVv0do",
    externalId: "X48VuDVv0do",
    title: "Authentic Thalassery Dum Biryani with Heritage Spices",
    titleMl: "ഒറിജിനൽ തലശ്ശേരി ദം ബിരിയാണി ഉണ്ടാക്കുന്ന വിധം",
    description: "Traditional Malabar Thalassery Dum Biryani cooked with fragrant Kaima rice and pure roasted whole spices.",
    descriptionMl: "പരമ്പരാഗത തലശ്ശേരി ദം ബിരിയാണി ഒറിജിനൽ രുചിയിൽ തയ്യാറാക്കാം.",
    category: "Heritage Recipes",
    thumbnailUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    duration: "18:10",
    status: "published",
    featured: false,
    displayOrder: 3,
  },
  {
    platform: "youtube",
    url: "https://www.youtube.com/watch?v=LXb3EKWsInQ",
    externalId: "LXb3EKWsInQ",
    title: "Coastal King Fish Tawa Fry with Roasted Spices",
    titleMl: "നാടൻ നെയ്മീൻ തവ ഫ്രൈ സ്പെഷ്യൽ മസാല കൂട്ട്",
    description: "Crispy and spicy Kerala coastal King Fish tawa fry seasoned with hand-ground red chilli and Tellicherry black pepper.",
    descriptionMl: "നാടൻ സ്റ്റൈൽ നെയ്മീൻ തവ ഫ്രൈ സ്പെഷ്യൽ മസാല കൂട്ടിനൊപ്പം.",
    category: "Seafood Specials",
    thumbnailUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
    duration: "09:30",
    status: "published",
    featured: false,
    displayOrder: 4,
  },
];

function ensureValidObjectId(id: string): mongoose.Types.ObjectId {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, "Invalid media item ID");
  }
  return new mongoose.Types.ObjectId(id);
}

export async function seedInitialMediaItems(): Promise<void> {
  try {
    const count = await MediaItemModel.countDocuments();
    if (count === 0) {
      await MediaItemModel.insertMany(INITIAL_COOKING_VIDEOS);
    }
  } catch {
    // Non-fatal if seeding is interrupted
  }
}

export async function listAdminMediaItems(query: MediaItemListQuery) {
  const filter: FilterQuery<IMediaItem> = {};

  if (query.platform && query.platform !== "all") {
    filter.platform = query.platform as MediaPlatform;
  }

  if (query.status && query.status !== "all") {
    filter.status = query.status as MediaStatus;
  }

  if (query.category && query.category.trim()) {
    filter.category = query.category.trim();
  }

  if (query.search && query.search.trim()) {
    const term = query.search.trim();
    filter.$or = [
      { title: { $regex: term, $options: "i" } },
      { titleMl: { $regex: term, $options: "i" } },
      { description: { $regex: term, $options: "i" } },
      { category: { $regex: term, $options: "i" } },
    ];
  }

  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 20));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    MediaItemModel.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    MediaItemModel.countDocuments(filter).exec(),
  ]);

  return {
    items,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1,
  };
}

export async function getMediaItemById(id: string) {
  const oid = ensureValidObjectId(id);
  const item = await MediaItemModel.findById(oid).lean().exec();
  if (!item) {
    throw new HttpError(404, "Media item not found");
  }
  return item;
}

export async function createMediaItem(input: MediaItemCreateInput, adminId?: string) {
  // 1. Validate & Parse URL according to selected platform
  const parsed = parseAndValidateMediaUrl(input.platform, input.url);
  if (!parsed) {
    if (input.platform === "youtube") {
      throw new HttpError(
        400,
        "Invalid YouTube URL. Supported formats: youtube.com/watch?v=..., youtu.be/..., or youtube.com/shorts/..."
      );
    } else {
      throw new HttpError(
        400,
        "Invalid Instagram Reel URL. Supported format: instagram.com/reel/REEL_ID/ or instagram.com/p/POST_ID/"
      );
    }
  }

  // 2. Resolve thumbnail URL
  let thumbnail = input.thumbnailUrl?.trim();
  if (!thumbnail) {
    thumbnail = parsed.defaultThumbnailUrl;
  }

  // 3. Resolve display order if not provided or 0
  let displayOrder = input.displayOrder;
  if (!displayOrder || displayOrder <= 0) {
    const maxItem = await MediaItemModel.findOne().sort({ displayOrder: -1 }).select("displayOrder").lean().exec();
    displayOrder = (maxItem?.displayOrder || 0) + 1;
  }

  const createdBy = adminId && mongoose.Types.ObjectId.isValid(adminId) ? new mongoose.Types.ObjectId(adminId) : undefined;

  const item = await MediaItemModel.create({
    platform: input.platform,
    url: parsed.normalizedUrl,
    externalId: parsed.externalId,
    title: input.title.trim(),
    titleMl: input.titleMl?.trim() || undefined,
    description: input.description.trim(),
    descriptionMl: input.descriptionMl?.trim() || undefined,
    category: input.category.trim(),
    thumbnailUrl: thumbnail,
    cloudinaryPublicId: input.cloudinaryPublicId?.trim() || undefined,
    duration: input.duration?.trim() || undefined,
    status: input.status || "published",
    featured: input.featured ?? false,
    displayOrder,
    createdBy,
    updatedBy: createdBy,
  });

  return item.toObject();
}

export async function updateMediaItem(id: string, input: MediaItemUpdateInput, adminId?: string) {
  const oid = ensureValidObjectId(id);
  const existing = await MediaItemModel.findById(oid).exec();
  if (!existing) {
    throw new HttpError(404, "Media item not found");
  }

  const targetPlatform = input.platform || existing.platform;
  const targetUrl = input.url ? input.url.trim() : existing.url;

  // If URL or platform is changing, revalidate
  if (input.url || input.platform) {
    const parsed = parseAndValidateMediaUrl(targetPlatform, targetUrl);
    if (!parsed) {
      throw new HttpError(
        400,
        `Invalid ${targetPlatform === "youtube" ? "YouTube" : "Instagram"} URL.`
      );
    }
    existing.platform = targetPlatform;
    existing.url = parsed.normalizedUrl;
    existing.externalId = parsed.externalId;

    // If no custom thumbnail was provided in update and thumbnail was default, update default
    if (!input.thumbnailUrl && (!existing.thumbnailUrl || existing.thumbnailUrl.includes("youtube.com"))) {
      existing.thumbnailUrl = parsed.defaultThumbnailUrl;
    }
  }

  if (input.title !== undefined) existing.title = input.title.trim();
  if (input.titleMl !== undefined) existing.titleMl = input.titleMl.trim();
  if (input.description !== undefined) existing.description = input.description.trim();
  if (input.descriptionMl !== undefined) existing.descriptionMl = input.descriptionMl.trim();
  if (input.category !== undefined) existing.category = input.category.trim();
  if (input.thumbnailUrl !== undefined) existing.thumbnailUrl = input.thumbnailUrl.trim();
  if (input.cloudinaryPublicId !== undefined) existing.cloudinaryPublicId = input.cloudinaryPublicId.trim();
  if (input.duration !== undefined) existing.duration = input.duration.trim();
  if (input.status !== undefined) existing.status = input.status;
  if (input.featured !== undefined) existing.featured = input.featured;
  if (input.displayOrder !== undefined) existing.displayOrder = input.displayOrder;

  if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
    existing.updatedBy = new mongoose.Types.ObjectId(adminId);
  }

  await existing.save();
  return existing.toObject();
}

export async function updateMediaItemStatus(id: string, status: MediaStatus, adminId?: string) {
  const oid = ensureValidObjectId(id);
  const updatedBy = adminId && mongoose.Types.ObjectId.isValid(adminId) ? new mongoose.Types.ObjectId(adminId) : undefined;

  const item = await MediaItemModel.findByIdAndUpdate(
    oid,
    { status, ...(updatedBy ? { updatedBy } : {}) },
    { new: true }
  ).lean().exec();

  if (!item) {
    throw new HttpError(404, "Media item not found");
  }

  return item;
}

export async function reorderMediaItems(
  items: Array<{ id: string; displayOrder: number }>,
  adminId?: string
) {
  const operations = items
    .filter((item) => mongoose.Types.ObjectId.isValid(item.id))
    .map((item) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(item.id) },
        update: {
          $set: {
            displayOrder: item.displayOrder,
            ...(adminId && mongoose.Types.ObjectId.isValid(adminId)
              ? { updatedBy: new mongoose.Types.ObjectId(adminId) }
              : {}),
          },
        },
      },
    }));

  if (operations.length > 0) {
    await MediaItemModel.bulkWrite(operations);
  }

  return { updated: operations.length };
}

export async function deleteMediaItem(id: string) {
  const oid = ensureValidObjectId(id);
  const item = await MediaItemModel.findById(oid).exec();
  if (!item) {
    throw new HttpError(404, "Media item not found");
  }

  // If a Cloudinary publicId is associated, safely clean up
  if (item.cloudinaryPublicId) {
    try {
      await deleteImage(item.cloudinaryPublicId);
    } catch {
      // Best effort cleanup
    }
  }

  const externalId = item.externalId;
  await item.deleteOne();
  return { deleted: true, id: String(oid), externalId };
}

export async function listPublicMediaItems(query?: { limit?: number; category?: string; platform?: string }) {
  const filter: FilterQuery<IMediaItem> = {
    status: "published",
  };

  if (query?.category && query.category !== "All") {
    filter.category = query.category;
  }

  if (query?.platform && query.platform !== "all") {
    filter.platform = query.platform as MediaPlatform;
  }

  const limit = query?.limit && query.limit > 0 ? Math.min(query.limit, 50) : 50;

  const items = await MediaItemModel.find(filter)
    .sort({ displayOrder: 1, createdAt: -1 })
    .limit(limit)
    .lean()
    .exec();

  return items.map((item) => ({
    id: String(item._id),
    platform: item.platform,
    url: item.url,
    externalId: item.externalId,
    title: item.title,
    titleMl: item.titleMl,
    description: item.description,
    descriptionMl: item.descriptionMl,
    category: item.category,
    thumbnailUrl: item.thumbnailUrl,
    duration: item.duration,
    featured: item.featured,
    displayOrder: item.displayOrder,
    createdAt: item.createdAt,
  }));
}

export async function getPublicMediaItem(idOrExternalId: string) {
  const filter: FilterQuery<IMediaItem> = {
    status: "published",
    $or: [
      { externalId: idOrExternalId },
    ],
  };

  if (mongoose.Types.ObjectId.isValid(idOrExternalId)) {
    filter.$or?.push({ _id: new mongoose.Types.ObjectId(idOrExternalId) });
  }

  const item = await MediaItemModel.findOne(filter).lean().exec();
  if (!item) {
    throw new HttpError(404, "Published media item not found");
  }

  return {
    id: String(item._id),
    platform: item.platform,
    url: item.url,
    externalId: item.externalId,
    title: item.title,
    titleMl: item.titleMl,
    description: item.description,
    descriptionMl: item.descriptionMl,
    category: item.category,
    thumbnailUrl: item.thumbnailUrl,
    duration: item.duration,
    featured: item.featured,
    displayOrder: item.displayOrder,
    createdAt: item.createdAt,
  };
}

// ─── ISO 8601 Duration Parser ────────────────────────────────────────────────

export function parseIso8601Duration(iso: string): string {
  if (!iso || typeof iso !== "string") return "";
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
  if (!match) return "";
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// ─── Automatic Metadata Fetching Service ────────────────────────────────────

export interface MediaMetadataResult {
  platform: "youtube" | "instagram";
  externalId: string;
  normalizedUrl: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  cloudinaryPublicId?: string;
  duration?: string;
  authorName?: string;
  fetchedVia: "youtube-data-api-v3" | "youtube-oembed" | "meta-oembed" | "fallback";
}

export async function fetchMediaMetadata(
  input: MediaFetchMetadataInput,
  env: Environment
): Promise<MediaMetadataResult> {
  const parsed = parseAndValidateMediaUrl(input.platform, input.url);
  if (!parsed) {
    throw new HttpError(
      400,
      `Invalid ${input.platform === "youtube" ? "YouTube" : "Instagram"} URL.`
    );
  }

  const { externalId, normalizedUrl, defaultThumbnailUrl } = parsed;

  if (input.platform === "youtube") {
    // 1. If YOUTUBE_API_KEY is configured in backend environment, use official YouTube Data API v3
    if (env.YOUTUBE_API_KEY) {
      try {
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${externalId}&key=${env.YOUTUBE_API_KEY}`;
        const res = await fetch(apiUrl, { signal: AbortSignal.timeout(6000) });
        if (res.ok) {
          const json = (await res.json()) as {
            items?: Array<{
              snippet?: {
                title?: string;
                description?: string;
                channelTitle?: string;
                thumbnails?: Record<string, { url?: string }>;
              };
              contentDetails?: {
                duration?: string;
              };
            }>;
          };

          if (json.items && json.items.length > 0) {
            const item = json.items[0];
            const snippet = item.snippet;
            const duration = parseIso8601Duration(item.contentDetails?.duration || "");
            const thumbs = snippet?.thumbnails || {};
            const thumbUrl =
              thumbs.maxres?.url ||
              thumbs.standard?.url ||
              thumbs.high?.url ||
              thumbs.medium?.url ||
              thumbs.default?.url ||
              defaultThumbnailUrl;

            return {
              platform: "youtube",
              externalId,
              normalizedUrl,
              title: snippet?.title || "",
              description: snippet?.description || "",
              thumbnailUrl: thumbUrl,
              duration: duration || undefined,
              authorName: snippet?.channelTitle || undefined,
              fetchedVia: "youtube-data-api-v3",
            };
          }
        }
      } catch {
        // Fall back to oEmbed below on network or key error
      }
    }

    // 2. Official YouTube oEmbed Fallback (always works without API key)
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${externalId}&format=json`;
      const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = (await res.json()) as {
          title?: string;
          author_name?: string;
          thumbnail_url?: string;
        };

        return {
          platform: "youtube",
          externalId,
          normalizedUrl,
          title: data.title || "",
          description: "", // oEmbed doesn't return video description
          thumbnailUrl: data.thumbnail_url || defaultThumbnailUrl,
          authorName: data.author_name || undefined,
          fetchedVia: "youtube-oembed",
        };
      }
    } catch {
      // Fall through to fallback
    }

    // 3. Graceful fallback with standard thumbnail
    return {
      platform: "youtube",
      externalId,
      normalizedUrl,
      title: "",
      description: "",
      thumbnailUrl: defaultThumbnailUrl,
      fetchedVia: "fallback",
    };
  }

  // Instagram handling
  if (env.INSTAGRAM_ACCESS_TOKEN) {
    try {
      const metaUrl = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(
        normalizedUrl
      )}&access_token=${env.INSTAGRAM_ACCESS_TOKEN}`;
      const res = await fetch(metaUrl, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = (await res.json()) as {
          title?: string;
          author_name?: string;
          thumbnail_url?: string;
        };

        let finalThumbnail = data.thumbnail_url || defaultThumbnailUrl;
        let cloudinaryPublicId: string | undefined;

        // Optimize thumbnail via Cloudinary if available
        if (data.thumbnail_url && isCloudinaryConfigured()) {
          try {
            const uploaded = await uploadImageFromUrl(data.thumbnail_url, {
              folder: "yumnest/reels",
              publicId: `reel_${externalId}`,
            });
            finalThumbnail = uploaded.secureUrl;
            cloudinaryPublicId = uploaded.publicId;
          } catch {
            // Keep direct thumbnail if Cloudinary upload fails
          }
        }

        return {
          platform: "instagram",
          externalId,
          normalizedUrl,
          title: data.title || `Instagram Reel (${externalId})`,
          description: "",
          thumbnailUrl: finalThumbnail,
          cloudinaryPublicId,
          authorName: data.author_name || undefined,
          fetchedVia: "meta-oembed",
        };
      }
    } catch {
      // Fall through to fallback
    }
  }

  // Graceful Instagram fallback with branded default thumbnail
  return {
    platform: "instagram",
    externalId,
    normalizedUrl,
    title: `Instagram Reel (${externalId})`,
    description: "",
    thumbnailUrl: defaultThumbnailUrl,
    fetchedVia: "fallback",
  };
}
