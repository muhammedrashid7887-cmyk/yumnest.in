import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import type { Environment } from "../config/env";
import { deleteMediaController, listMediaController, uploadMediaController } from "../controllers/media.controller";
import { validateParams } from "../middleware/validateParams";
import { HttpError } from "../utils/httpError";
import { idParamSchema } from "../validators/catalogue.validators";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export function mediaRouter(env: Environment): Router {
  const router = Router();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 10, fields: 10, parts: 20 },
    fileFilter: (_request, file, callback) => {
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        callback(new HttpError(415, "Unsupported image format"));
        return;
      }
      callback(null, true);
    },
  });
  const uploadLimiter = rateLimit({
    windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, error: { code: "RATE_LIMITED", message: "Too many media requests" } },
  });
  router.post("/admin/media/upload", uploadLimiter, upload.array("files", 10), uploadMediaController);
  router.get("/admin/media", listMediaController);
  router.delete("/admin/media/:id", validateParams(idParamSchema), deleteMediaController);

  return router;
}
