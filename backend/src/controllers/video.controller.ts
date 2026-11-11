import type { Request, Response } from "express";
import { emitToAll } from "../services/socket.service";
import { SOCKET_EVENTS } from "../constants/socket-events";
import {
  listPublishedVideos,
  listAdminVideos,
  getVideoById,
  getVideoStats,
  createVideo,
  updateVideo,
  toggleVideoPublish,
  regenerateVideoThumbnail,
  replaceVideo,
  reorderVideos,
  deleteVideoRecord,
} from "../services/video.service";
import {
  generateVideoUploadSignature,
  uploadVideo,
} from "../config/cloudinary";
import { HttpError } from "../utils/httpError";
import {
  videoCreateSchema,
  videoUpdateSchema,
  videoPublishToggleSchema,
  videoRegenerateThumbnailSchema,
  videoReplaceSchema,
  videoReorderSchema,
  videoListQuerySchema,
  videoPublicQuerySchema,
} from "../validators/video.validators";

/**
 * Generate a signed upload token so the frontend can upload directly to Cloudinary.
 * Bypasses Render request size limits and prevents proxy timeouts.
 */
export const signVideoUploadController = async (_req: Request, res: Response): Promise<void> => {
  const signData = generateVideoUploadSignature("yumnest/videos");
  res.status(200).json({
    success: true,
    data: signData,
  });
};

/**
 * Server-side fallback upload controller for video files.
 */
export const uploadVideoController = async (req: Request, res: Response): Promise<void> => {
  const file = req.file;
  if (!file) {
    throw new HttpError(400, "A video file is required");
  }

  const uploaded = await uploadVideo(file.buffer, {
    folder: "yumnest/videos",
  });

  res.status(201).json({
    success: true,
    data: uploaded,
  });
};

/**
 * List published videos for the customer-facing storefront.
 */
export const listPublicVideosController = async (req: Request, res: Response): Promise<void> => {
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  const parsed = videoPublicQuerySchema.safeParse(req.query);
  const query = parsed.success ? parsed.data : { limit: 20 };
  const videos = await listPublishedVideos(query);

  res.status(200).json({
    success: true,
    data: videos,
  });
};

/**
 * List all videos (published & draft) for the admin dashboard.
 */
export const listAdminVideosController = async (req: Request, res: Response): Promise<void> => {
  const parsed = videoListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new HttpError(400, "Invalid query parameters");
  }

  const result = await listAdminVideos(parsed.data);
  res.status(200).json({
    success: true,
    data: result.items,
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
    },
  });
};

/**
 * Fetch video database summary statistics for admin counters.
 */
export const getVideoStatsController = async (_req: Request, res: Response): Promise<void> => {
  const stats = await getVideoStats();
  res.status(200).json({
    success: true,
    data: stats,
  });
};

/**
 * Get single video by ID.
 */
export const getVideoByIdController = async (req: Request, res: Response): Promise<void> => {
  const video = await getVideoById(req.params.id as string);
  res.status(200).json({
    success: true,
    data: { video },
  });
};

/**
 * Create a new video record in MongoDB after upload.
 */
export const createVideoController = async (req: Request, res: Response): Promise<void> => {
  const adminId = req.auth?.id ?? "admin_root";
  const parsed = videoCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    const errorMsg = parsed.error.errors.map((e) => e.message).join(", ");
    throw new HttpError(400, `Validation failed: ${errorMsg}`);
  }

  const video = await createVideo(parsed.data, adminId);

  // Emit Socket.IO events for live storefront synchronization
  emitToAll(SOCKET_EVENTS.VIDEO_CREATED, { video });
  if (video.isPublished) {
    emitToAll(SOCKET_EVENTS.VIDEO_PUBLISHED, { video });
  }

  res.status(201).json({
    success: true,
    data: { video },
  });
};

/**
 * Update video metadata.
 */
export const updateVideoController = async (req: Request, res: Response): Promise<void> => {
  const adminId = req.auth?.id ?? "admin_root";
  const parsed = videoUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    const errorMsg = parsed.error.errors.map((e) => e.message).join(", ");
    throw new HttpError(400, `Validation failed: ${errorMsg}`);
  }

  const video = await updateVideo(req.params.id as string, parsed.data, adminId);
  emitToAll(SOCKET_EVENTS.VIDEO_UPDATED, { video });

  res.status(200).json({
    success: true,
    data: { video },
  });
};

/**
 * Toggle publish / unpublish status.
 */
export const toggleVideoPublishController = async (req: Request, res: Response): Promise<void> => {
  const adminId = req.auth?.id ?? "admin_root";
  const parsed = videoPublishToggleSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "Invalid publish toggle value (boolean required)");
  }

  const video = await toggleVideoPublish(req.params.id as string, parsed.data.isPublished, adminId);

  // Emit publish or unpublish event
  if (video.isPublished) {
    emitToAll(SOCKET_EVENTS.VIDEO_PUBLISHED, { video });
  } else {
    emitToAll(SOCKET_EVENTS.VIDEO_UNPUBLISHED, { id: video.cloudinaryPublicId, videoId: (video as unknown as { _id: string })._id });
  }
  emitToAll(SOCKET_EVENTS.VIDEO_UPDATED, { video });

  res.status(200).json({
    success: true,
    data: { video },
  });
};

/**
 * Regenerate automatic thumbnail from video at specified frame second.
 */
export const regenerateVideoThumbnailController = async (req: Request, res: Response): Promise<void> => {
  const parsed = videoRegenerateThumbnailSchema.safeParse(req.body);
  const offsetSeconds = parsed.success ? parsed.data.offsetSeconds : 1;

  const video = await regenerateVideoThumbnail(req.params.id as string, offsetSeconds);
  emitToAll(SOCKET_EVENTS.VIDEO_UPDATED, { video });

  res.status(200).json({
    success: true,
    data: { video },
  });
};

/**
 * Replace the video binary file while keeping metadata.
 */
export const replaceVideoController = async (req: Request, res: Response): Promise<void> => {
  const adminId = req.auth?.id ?? "admin_root";
  const parsed = videoReplaceSchema.safeParse(req.body);
  if (!parsed.success) {
    const errorMsg = parsed.error.errors.map((e) => e.message).join(", ");
    throw new HttpError(400, `Validation failed: ${errorMsg}`);
  }

  const video = await replaceVideo(req.params.id as string, parsed.data, adminId);
  emitToAll(SOCKET_EVENTS.VIDEO_UPDATED, { video });

  res.status(200).json({
    success: true,
    data: { video },
  });
};

/**
 * Bulk reorder videos display order.
 */
export const reorderVideosController = async (req: Request, res: Response): Promise<void> => {
  const adminId = req.auth?.id ?? "admin_root";
  const parsed = videoReorderSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "Invalid reorder payload");
  }

  const result = await reorderVideos(parsed.data.items, adminId);
  emitToAll(SOCKET_EVENTS.VIDEO_UPDATED, { reordered: true, items: parsed.data.items });

  res.status(200).json({
    success: true,
    data: result,
  });
};

/**
 * Delete video from MongoDB and delete Cloudinary assets.
 */
export const deleteVideoController = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  await deleteVideoRecord(id);
  emitToAll(SOCKET_EVENTS.VIDEO_DELETED, { id });

  res.status(200).json({
    success: true,
    data: { deleted: true, id },
  });
};
