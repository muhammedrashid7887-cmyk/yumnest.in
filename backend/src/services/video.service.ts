import mongoose, { type FilterQuery } from "mongoose";
import { VideoModel, type IVideo } from "../models/video.model";
import {
  generateVideoThumbnailUrl,
  deleteVideo,
  deleteImage,
} from "../config/cloudinary";
import { HttpError } from "../utils/httpError";
import type {
  VideoCreateInput,
  VideoUpdateInput,
  VideoListQuery,
  VideoPublicQuery,
  VideoReplaceInput,
} from "../validators/video.validators";

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "00:00";
  const totalSeconds = Math.round(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

function ensureValidObjectId(id: string): mongoose.Types.ObjectId {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, "Invalid video ID format");
  }
  return new mongoose.Types.ObjectId(id);
}

// Initial seed videos showcasing native HTML5 playback and culinary masterclasses
const INITIAL_NATIVE_VIDEOS: Array<Omit<IVideo, "createdAt" | "updatedAt">> = [
  {
    title: "Crispy Restaurant-Style Broasted Chicken Masterclass",
    description: "Learn how to achieve the iconic flaky crunchy crust and juicy succulent tenderness using authentic Yumnest Broast Masala.",
    cloudinaryPublicId: "samples/food/pot-mussel",
    videoUrl: "https://res.cloudinary.com/demo/video/upload/q_auto,vc_auto/cld_rubiks_bake.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
    duration: 185,
    durationFormatted: "03:05",
    format: "mp4",
    width: 1280,
    height: 720,
    fileSize: 8450200,
    category: "Broast Special",
    isPublished: true,
    displayOrder: 1,
  },
  {
    title: "Authentic Charcoal-Grilled Alfaham Chicken Guide",
    description: "Traditional Malabar and Arabian charcoal slow-grill technique with aromatic roasted whole spices and garlic butter.",
    cloudinaryPublicId: "samples/food/alfaham-guide",
    videoUrl: "https://res.cloudinary.com/demo/video/upload/q_auto,vc_auto/cld_rubiks_bake.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80",
    duration: 240,
    durationFormatted: "04:00",
    format: "mp4",
    width: 1280,
    height: 720,
    fileSize: 11240000,
    category: "Signature Rubs",
    isPublished: true,
    displayOrder: 2,
  },
  {
    title: "Heritage Thalassery Dum Biryani Slow Cooking Secret",
    description: "Layering fragrant Kaima rice with tender meat infused with hand-roasted Malabar spices in heavy sealed cookware.",
    cloudinaryPublicId: "samples/food/dum-biryani",
    videoUrl: "https://res.cloudinary.com/demo/video/upload/q_auto,vc_auto/cld_rubiks_bake.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    duration: 310,
    durationFormatted: "05:10",
    format: "mp4",
    width: 1280,
    height: 720,
    fileSize: 14500000,
    category: "Heritage Recipes",
    isPublished: true,
    displayOrder: 3,
  },
];

export async function seedInitialVideos(): Promise<void> {
  try {
    const count = await VideoModel.countDocuments();
    if (count === 0) {
      await VideoModel.insertMany(INITIAL_NATIVE_VIDEOS);
    }
  } catch {
    // Non-fatal if seeding is interrupted
  }
}

/**
 * List published videos for the customer-facing storefront.
 */
export async function listPublishedVideos(query: VideoPublicQuery): Promise<IVideo[]> {
  await seedInitialVideos();

  const filter: FilterQuery<IVideo> = { isPublished: true };
  if (query.category && query.category.trim()) {
    filter.category = query.category.trim();
  }

  const limit = Math.min(Math.max(query.limit || 20, 1), 50);

  return VideoModel.find(filter)
    .sort({ displayOrder: 1, createdAt: -1 })
    .limit(limit)
    .lean<IVideo[]>()
    .exec();
}

/**
 * List all videos (published & draft) for the Admin Media Management panel.
 */
export async function listAdminVideos(query: VideoListQuery): Promise<{
  items: IVideo[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}> {
  await seedInitialVideos();

  const filter: FilterQuery<IVideo> = {};

  if (query.status && query.status !== "all") {
    filter.isPublished = query.status === "published";
  }

  if (query.category && query.category !== "all") {
    filter.category = query.category;
  }

  if (query.search && query.search.trim()) {
    const term = query.search.trim();
    filter.$or = [
      { title: { $regex: term, $options: "i" } },
      { description: { $regex: term, $options: "i" } },
      { category: { $regex: term, $options: "i" } },
    ];
  }

  const page = Math.max(query.page || 1, 1);
  const limit = Math.min(Math.max(query.limit || 20, 1), 100);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    VideoModel.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<IVideo[]>()
      .exec(),
    VideoModel.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Get single video by ID.
 */
export async function getVideoById(id: string): Promise<IVideo> {
  const objectId = ensureValidObjectId(id);
  const video = await VideoModel.findById(objectId).lean<IVideo>().exec();
  if (!video) {
    throw new HttpError(404, "Video not found");
  }
  return video;
}

/**
 * Create a new video record in MongoDB after successful Cloudinary upload.
 */
export async function createVideo(input: VideoCreateInput, adminId: string): Promise<IVideo> {
  const autoThumb = generateVideoThumbnailUrl(input.cloudinaryPublicId, {
    offsetSeconds: 1,
    width: 800,
    height: 450,
  });

  const finalThumbnail = input.customThumbnailUrl || input.thumbnailUrl || autoThumb;
  const durationFormatted = formatDuration(input.duration || 0);

  const doc = new VideoModel({
    title: input.title,
    description: input.description || "",
    cloudinaryPublicId: input.cloudinaryPublicId,
    cloudinaryAssetId: input.cloudinaryAssetId,
    videoUrl: input.videoUrl,
    thumbnailUrl: finalThumbnail,
    customThumbnailUrl: input.customThumbnailUrl,
    duration: input.duration || 0,
    durationFormatted,
    format: input.format || "mp4",
    width: input.width || 1280,
    height: input.height || 720,
    fileSize: input.fileSize || 0,
    category: input.category,
    isPublished: input.isPublished ?? true,
    displayOrder: input.displayOrder ?? 0,
    instagramSourceUrl: input.instagramSourceUrl,
    createdBy: mongoose.Types.ObjectId.isValid(adminId) ? new mongoose.Types.ObjectId(adminId) : undefined,
    updatedBy: mongoose.Types.ObjectId.isValid(adminId) ? new mongoose.Types.ObjectId(adminId) : undefined,
  });

  await doc.save();
  return doc.toObject<IVideo>();
}

/**
 * Update video metadata.
 */
export async function updateVideo(id: string, input: VideoUpdateInput, adminId: string): Promise<IVideo> {
  const objectId = ensureValidObjectId(id);
  const existing = await VideoModel.findById(objectId);
  if (!existing) {
    throw new HttpError(404, "Video not found");
  }

  if (input.title !== undefined) existing.title = input.title;
  if (input.description !== undefined) existing.description = input.description;
  if (input.category !== undefined) existing.category = input.category;
  if (input.displayOrder !== undefined) existing.displayOrder = input.displayOrder;
  if (input.isPublished !== undefined) existing.isPublished = input.isPublished;
  if (input.instagramSourceUrl !== undefined) existing.instagramSourceUrl = input.instagramSourceUrl || undefined;

  if (input.customThumbnailUrl !== undefined) {
    if (input.customThumbnailUrl) {
      existing.customThumbnailUrl = input.customThumbnailUrl;
      existing.thumbnailUrl = input.customThumbnailUrl;
    } else {
      // Revert to Cloudinary auto thumbnail
      existing.customThumbnailUrl = undefined;
      existing.thumbnailUrl = generateVideoThumbnailUrl(existing.cloudinaryPublicId, {
        offsetSeconds: 1,
        width: 800,
        height: 450,
      });
    }
  }

  if (mongoose.Types.ObjectId.isValid(adminId)) {
    existing.updatedBy = new mongoose.Types.ObjectId(adminId);
  }

  await existing.save();
  return existing.toObject<IVideo>();
}

/**
 * Toggle publish status of a video.
 */
export async function toggleVideoPublish(id: string, isPublished: boolean, adminId: string): Promise<IVideo> {
  const objectId = ensureValidObjectId(id);
  const existing = await VideoModel.findById(objectId);
  if (!existing) {
    throw new HttpError(404, "Video not found");
  }

  existing.isPublished = isPublished;
  if (mongoose.Types.ObjectId.isValid(adminId)) {
    existing.updatedBy = new mongoose.Types.ObjectId(adminId);
  }

  await existing.save();
  return existing.toObject<IVideo>();
}

/**
 * Regenerate video thumbnail from a specific frame offset.
 */
export async function regenerateVideoThumbnail(id: string, offsetSeconds: number): Promise<IVideo> {
  const objectId = ensureValidObjectId(id);
  const existing = await VideoModel.findById(objectId);
  if (!existing) {
    throw new HttpError(404, "Video not found");
  }

  const newThumbnail = generateVideoThumbnailUrl(existing.cloudinaryPublicId, {
    offsetSeconds: Math.max(0, offsetSeconds || 1),
    width: 800,
    height: 450,
  });

  existing.thumbnailUrl = newThumbnail;
  existing.customThumbnailUrl = undefined; // Clears custom override
  await existing.save();
  return existing.toObject<IVideo>();
}

/**
 * Replace the video binary while preserving metadata and order.
 * Deletes the old Cloudinary video asset.
 */
export async function replaceVideo(id: string, input: VideoReplaceInput, adminId: string): Promise<IVideo> {
  const objectId = ensureValidObjectId(id);
  const existing = await VideoModel.findById(objectId);
  if (!existing) {
    throw new HttpError(404, "Video not found");
  }

  const oldPublicId = existing.cloudinaryPublicId;

  // Generate new thumbnail from the new video
  const newThumb = input.thumbnailUrl || generateVideoThumbnailUrl(input.cloudinaryPublicId, {
    offsetSeconds: 1,
    width: 800,
    height: 450,
  });

  existing.cloudinaryPublicId = input.cloudinaryPublicId;
  if (input.cloudinaryAssetId) existing.cloudinaryAssetId = input.cloudinaryAssetId;
  existing.videoUrl = input.videoUrl;
  existing.thumbnailUrl = existing.customThumbnailUrl || newThumb;
  if (input.duration !== undefined) {
    existing.duration = input.duration;
    existing.durationFormatted = formatDuration(input.duration);
  }
  if (input.format) existing.format = input.format;
  if (input.width) existing.width = input.width;
  if (input.height) existing.height = input.height;
  if (input.fileSize) existing.fileSize = input.fileSize;

  if (mongoose.Types.ObjectId.isValid(adminId)) {
    existing.updatedBy = new mongoose.Types.ObjectId(adminId);
  }

  await existing.save();

  // Safely delete old Cloudinary asset in background
  if (oldPublicId && oldPublicId !== input.cloudinaryPublicId) {
    deleteVideo(oldPublicId).catch(() => {});
  }

  return existing.toObject<IVideo>();
}

/**
 * Bulk reorder videos display orders.
 */
export async function reorderVideos(
  items: Array<{ id: string; displayOrder: number }>,
  _adminId: string
): Promise<{ success: boolean; updatedCount: number }> {
  const bulkOps = items
    .filter((item) => mongoose.Types.ObjectId.isValid(item.id))
    .map((item) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(item.id) },
        update: { $set: { displayOrder: item.displayOrder } },
      },
    }));

  if (bulkOps.length === 0) {
    return { success: true, updatedCount: 0 };
  }

  const result = await VideoModel.bulkWrite(bulkOps);
  return { success: true, updatedCount: result.modifiedCount };
}

/**
 * Delete video from MongoDB and delete its Cloudinary assets.
 */
export async function deleteVideoRecord(id: string): Promise<{ deleted: boolean; id: string }> {
  const objectId = ensureValidObjectId(id);
  const existing = await VideoModel.findById(objectId);
  if (!existing) {
    throw new HttpError(404, "Video not found");
  }

  const videoPublicId = existing.cloudinaryPublicId;

  await VideoModel.findByIdAndDelete(objectId);

  // Safely delete Cloudinary video asset
  if (videoPublicId) {
    deleteVideo(videoPublicId).catch(() => {});
  }

  return { deleted: true, id };
}
