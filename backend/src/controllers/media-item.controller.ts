import type { Request, Response } from "express";
import { emitToAll } from "../services/socket.service";
import { SOCKET_EVENTS } from "../constants/socket-events";
import {
  listAdminMediaItems,
  getMediaItemById,
  createMediaItem,
  updateMediaItem,
  updateMediaItemStatus,
  reorderMediaItems,
  deleteMediaItem,
  listPublicMediaItems,
  getPublicMediaItem,
  fetchMediaMetadata,
} from "../services/media-item.service";
import { uploadMedia } from "../services/media.service";
import { HttpError } from "../utils/httpError";
import {
  mediaItemCreateSchema,
  mediaItemUpdateSchema,
  mediaItemStatusSchema,
  mediaItemReorderSchema,
  mediaItemListQuerySchema,
  mediaFetchMetadataSchema,
} from "../validators/media-item.validators";
import type { Environment } from "../config/env";

export const listMediaItemsController = async (request: Request, response: Response): Promise<void> => {
  const parsedQuery = mediaItemListQuerySchema.safeParse(request.query);
  if (!parsedQuery.success) {
    throw new HttpError(400, "Invalid query parameters");
  }
  const result = await listAdminMediaItems(parsedQuery.data);
  response.status(200).json({
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

export const getMediaItemController = async (request: Request, response: Response): Promise<void> => {
  const item = await getMediaItemById(request.params.id as string);
  response.status(200).json({
    success: true,
    data: { item },
  });
};

export const createMediaItemController = async (request: Request, response: Response): Promise<void> => {
  const adminId = request.auth?.id ?? "admin_root";
  const parsedBody = mediaItemCreateSchema.safeParse(request.body);
  if (!parsedBody.success) {
    const errorMsg = parsedBody.error.errors.map((e) => e.message).join(", ");
    throw new HttpError(400, `Validation failed: ${errorMsg}`);
  }
  const item = await createMediaItem(parsedBody.data, adminId);
  emitToAll(SOCKET_EVENTS.VIDEO_CREATED, { item });
  response.status(201).json({
    success: true,
    data: { item },
  });
};

export const updateMediaItemController = async (request: Request, response: Response): Promise<void> => {
  const adminId = request.auth?.id ?? "admin_root";
  const parsedBody = mediaItemUpdateSchema.safeParse(request.body);
  if (!parsedBody.success) {
    const errorMsg = parsedBody.error.errors.map((e) => e.message).join(", ");
    throw new HttpError(400, `Validation failed: ${errorMsg}`);
  }
  const item = await updateMediaItem(request.params.id as string, parsedBody.data, adminId);
  emitToAll(SOCKET_EVENTS.VIDEO_UPDATED, { item });
  response.status(200).json({
    success: true,
    data: { item },
  });
};

export const updateMediaItemStatusController = async (request: Request, response: Response): Promise<void> => {
  const adminId = request.auth?.id ?? "admin_root";
  const parsedBody = mediaItemStatusSchema.safeParse(request.body);
  if (!parsedBody.success) {
    throw new HttpError(400, "Invalid status. Allowed: draft, published, archived");
  }
  const item = await updateMediaItemStatus(request.params.id as string, parsedBody.data.status, adminId);
  emitToAll(SOCKET_EVENTS.VIDEO_UPDATED, { item });
  response.status(200).json({
    success: true,
    data: { item },
  });
};

export const reorderMediaItemsController = async (request: Request, response: Response): Promise<void> => {
  const adminId = request.auth?.id ?? "admin_root";
  const parsedBody = mediaItemReorderSchema.safeParse(request.body);
  if (!parsedBody.success) {
    throw new HttpError(400, "Invalid reorder data");
  }
  const result = await reorderMediaItems(parsedBody.data.items, adminId);
  emitToAll(SOCKET_EVENTS.VIDEO_UPDATED, { reordered: true, items: parsedBody.data.items });
  response.status(200).json({
    success: true,
    data: result,
  });
};

export const deleteMediaItemController = async (request: Request, response: Response): Promise<void> => {
  const id = request.params.id as string;
  const result = await deleteMediaItem(id);
  emitToAll(SOCKET_EVENTS.VIDEO_DELETED, { id, externalId: result.externalId });
  response.status(200).json({
    success: true,
    data: { deleted: true, id, externalId: result.externalId },
  });
};

export const uploadMediaThumbnailController = async (request: Request, response: Response): Promise<void> => {
  const adminId = request.auth?.id ?? "admin_root";
  const multerFiles = (request.files as Express.Multer.File[] | undefined) ?? (request.file ? [request.file] : []);
  if (multerFiles.length === 0) {
    throw new HttpError(400, "A thumbnail image file is required");
  }

  const uploaded = await uploadMedia(multerFiles, { folder: "products", altText: request.body.altText }, adminId);
  const img = uploaded[0];
  response.status(201).json({
    success: true,
    data: {
      image: {
        secureUrl: img.secureUrl,
        publicId: img.publicId,
        format: img.format,
        width: img.width,
        height: img.height,
      },
    },
  });
};

export const fetchMediaMetadataController = (env: Environment) => async (
  request: Request,
  response: Response
): Promise<void> => {
  const parsedBody = mediaFetchMetadataSchema.safeParse(request.body);
  if (!parsedBody.success) {
    const errorMsg = parsedBody.error.errors.map((e) => e.message).join(", ");
    throw new HttpError(400, `Validation failed: ${errorMsg}`);
  }
  const result = await fetchMediaMetadata(parsedBody.data, env);
  response.status(200).json({
    success: true,
    data: result,
  });
};

export const listPublicMediaItemsController = async (request: Request, response: Response): Promise<void> => {
  response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  response.setHeader("Pragma", "no-cache");
  response.setHeader("Expires", "0");
  const items = await listPublicMediaItems({
    limit: request.query.limit ? Number(request.query.limit) : undefined,
    category: typeof request.query.category === "string" ? request.query.category : undefined,
    platform: typeof request.query.platform === "string" ? request.query.platform : undefined,
  });
  response.status(200).json({
    success: true,
    data: items,
  });
};

export const getPublicMediaItemController = async (request: Request, response: Response): Promise<void> => {
  response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  response.setHeader("Pragma", "no-cache");
  response.setHeader("Expires", "0");
  const item = await getPublicMediaItem(request.params.idOrExternalId as string);
  response.status(200).json({
    success: true,
    data: { item },
  });
};
