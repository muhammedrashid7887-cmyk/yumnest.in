import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import type { Environment } from "../config/env";
import {
  signVideoUploadController,
  uploadVideoController,
  listPublicVideosController,
  listAdminVideosController,
  getVideoByIdController,
  createVideoController,
  updateVideoController,
  toggleVideoPublishController,
  regenerateVideoThumbnailController,
  replaceVideoController,
  reorderVideosController,
  deleteVideoController,
} from "../controllers/video.controller";
import { requireAuthenticatedAdmin, requireAdminRole } from "../middleware/auth";
import { validateParams } from "../middleware/validateParams";
import { HttpError } from "../utils/httpError";
import { idParamSchema } from "../validators/catalogue.validators";

const ALLOWED_VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime", // MOV
  "video/x-matroska", // MKV
]);

export function videoRouter(env: Environment): Router {
  const router = Router();
  const authenticated = requireAuthenticatedAdmin(env);
  const canWrite = requireAdminRole(env, "owner", "admin");

  // Server-side video upload fallback (max 100MB)
  const videoUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024, files: 1 },
    fileFilter: (_request, file, callback) => {
      if (!ALLOWED_VIDEO_MIME_TYPES.has(file.mimetype)) {
        callback(
          new HttpError(
            415,
            "Unsupported video format. Allowed formats: MP4, WebM, MOV."
          )
        );
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
    message: {
      success: false,
      error: { code: "RATE_LIMITED", message: "Too many video upload requests" },
    },
  });

  // ─── Public Storefront Endpoints ──────────────────────────────────────────
  router.get("/", listPublicVideosController);
  router.get("/public", listPublicVideosController);
  router.get("/:id", validateParams(idParamSchema), getVideoByIdController);

  // ─── Admin Video Management Endpoints ─────────────────────────────────────
  router.get("/admin/list", authenticated, listAdminVideosController);
  router.post("/admin/sign-upload", canWrite, signVideoUploadController);
  router.post(
    "/admin/upload",
    canWrite,
    uploadLimiter,
    videoUpload.single("video"),
    uploadVideoController
  );
  router.post("/admin", canWrite, createVideoController);
  router.patch("/admin/reorder", canWrite, reorderVideosController);
  router.patch(
    "/admin/:id/publish",
    canWrite,
    validateParams(idParamSchema),
    toggleVideoPublishController
  );
  router.post(
    "/admin/:id/regenerate-thumbnail",
    canWrite,
    validateParams(idParamSchema),
    regenerateVideoThumbnailController
  );
  router.put(
    "/admin/:id/replace",
    canWrite,
    validateParams(idParamSchema),
    replaceVideoController
  );
  router.patch(
    "/admin/:id",
    canWrite,
    validateParams(idParamSchema),
    updateVideoController
  );
  router.delete(
    "/admin/:id",
    canWrite,
    validateParams(idParamSchema),
    deleteVideoController
  );

  return router;
}
