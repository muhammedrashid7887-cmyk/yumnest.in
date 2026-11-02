import type { Request, Response } from "express";
import { deleteMedia, listMedia, uploadMedia } from "../services/media.service";
import { HttpError } from "../utils/httpError";
import { mediaListQuerySchema, mediaUploadSchema } from "../validators/media.validators";

export const uploadMediaController = async (request: Request, response: Response): Promise<void> => {
  const adminId = request.auth?.id ?? "admin_root";
  const parsedBody = mediaUploadSchema.safeParse({ folder: request.body.folder, altText: request.body.altText });
  if (!parsedBody.success) throw new HttpError(400, "Invalid media upload options");
  const files = (request.files as Express.Multer.File[] | undefined) ?? [];
  const media = await uploadMedia(files, parsedBody.data, adminId);
  response.status(201).json({ success: true, data: { media } });
};

export const listMediaController = async (request: Request, response: Response): Promise<void> => {
  const parsedQuery = mediaListQuerySchema.safeParse(request.query);
  if (!parsedQuery.success) throw new HttpError(400, "Invalid media query parameters");
  const result = await listMedia(parsedQuery.data);
  response.status(200).json({ success: true, data: result.items, meta: { total: result.total, page: result.page, limit: result.limit, pages: result.pages } });
};

export const deleteMediaController = async (request: Request, response: Response): Promise<void> => {
  await deleteMedia(request.params.id as string);
  response.status(200).json({ success: true, data: { deleted: true } });
};
