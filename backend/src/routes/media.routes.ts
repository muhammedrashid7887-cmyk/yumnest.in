import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import type { Environment } from "../config/env";
import {
  listMediaItemsController,
  getMediaItemController,
  createMediaItemController,
  updateMediaItemController,
  updateMediaItemStatusController,
  reorderMediaItemsController,
  deleteMediaItemController,
  uploadMediaThumbnailController,
  fetchMediaMetadataController,
  listPublicMediaItemsController,
  getPublicMediaItemController,
} from "../controllers/media-item.controller";
import { deleteMediaController, listMediaController, uploadMediaController } from "../controllers/media.controller";
import { requireAuthenticatedAdmin, requireAdminRole } from "../middleware/auth";
import { validateParams } from "../middleware/validateParams";
import { HttpError } from "../utils/httpError";
import { idParamSchema } from "../validators/catalogue.validators";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export function mediaRouter(env: Environment): Router {
  const router = Router();
  const authenticated = requireAuthenticatedAdmin(env);
  const canWrite = requireAdminRole(env, "owner", "admin");

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 10, fields: 10, parts: 20 },
    fileFilter: (_request, file, callback) => {
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        callback(new HttpError(415, "Unsupported image format. Allowed: JPEG, PNG, WebP, AVIF"));
        return;
      }
      callback(null, true);
    },
  });

  const uploadLimiter = rateLimit({
    windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
    limit: 60,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, error: { code: "RATE_LIMITED", message: "Too many media requests" } },
  });

  // ─── Admin Media Items (YouTube & Instagram) ──────────────────────────────
  router.get("/admin/media", authenticated, listMediaItemsController);
  router.post("/admin/media/fetch-metadata", canWrite, fetchMediaMetadataController(env));
  router.get("/admin/media/:id", authenticated, validateParams(idParamSchema), getMediaItemController);
  router.post("/admin/media", canWrite, createMediaItemController);
  router.patch("/admin/media/reorder", canWrite, reorderMediaItemsController);
  router.patch("/admin/media/:id/status", canWrite, validateParams(idParamSchema), updateMediaItemStatusController);
  router.patch("/admin/media/:id", canWrite, validateParams(idParamSchema), updateMediaItemController);
  router.delete("/admin/media/:id", canWrite, validateParams(idParamSchema), deleteMediaItemController);

  // ─── Admin Thumbnail / Asset Upload ───────────────────────────────────────
  router.post("/admin/media/upload-thumbnail", canWrite, uploadLimiter, upload.any(), uploadMediaThumbnailController);
  router.post("/admin/media/upload", canWrite, uploadLimiter, upload.array("files", 10), uploadMediaController);
  router.get("/admin/media/assets", authenticated, listMediaController);
  router.delete("/admin/media/assets/:id", canWrite, validateParams(idParamSchema), deleteMediaController);

  // ─── Public Storefront Media Endpoints ────────────────────────────────────
  router.get("/storefront/media", listPublicMediaItemsController);
  router.get("/storefront/media/:idOrExternalId", getPublicMediaItemController);
  router.get("/media", listPublicMediaItemsController);
  router.get("/media/:idOrExternalId", getPublicMediaItemController);

  return router;
}
