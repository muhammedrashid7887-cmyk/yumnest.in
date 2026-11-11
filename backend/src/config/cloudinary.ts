import { v2 as cloudinary } from "cloudinary";
import { loadEnvironment } from "./env";
import { HttpError } from "../utils/httpError";
import { logger } from "../utils/logger";

let configured = false;

export function isCloudinaryConfigured(): boolean {
  const env = loadEnvironment();
  return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}

function ensureConfigured() {
  const env = loadEnvironment();
  if (!isCloudinaryConfigured()) throw new HttpError(503, "Media service is not configured");
  if (!configured) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

export function uploadImage(buffer: Buffer, options: { folder: string; publicId: string }) {
  const client = ensureConfigured();
  return new Promise<{
    publicId: string;
    secureUrl: string;
    width?: number;
    height?: number;
    format: string;
    bytes: number;
    resourceType: string;
  }>((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.publicId,
        resource_type: "image",
        overwrite: false,
        unique_filename: false,
        invalidate: true,
      },
      (error, result) => {
        if (error || !result) {
          logger.error("Cloudinary upload failed", { error });
          const rawMessage = error && typeof error === "object" && "message" in error ? String((error as { message: unknown }).message) : "";
          const isPermissionError = rawMessage.includes("missing permissions") || rawMessage.includes("Request forbidden");
          const userMessage = isPermissionError
            ? `Media provider error: Cloudinary API Key is missing write permissions (actions=["create"]). In Cloudinary Console -> Settings -> Access Keys, ensure the key has create/upload permissions enabled or use a full-access key.`
            : (rawMessage ? `Media provider upload failed: ${rawMessage}` : "Media provider upload failed");
          reject(new HttpError(502, userMessage));
          return;
        }
        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          resourceType: result.resource_type,
        });
      }
    );
    stream.end(buffer);
  });
}

export async function uploadImageFromUrl(
  remoteUrl: string,
  options: { folder: string; publicId?: string }
): Promise<{
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
  format?: string;
}> {
  const client = ensureConfigured();
  const res = await client.uploader.upload(remoteUrl, {
    folder: options.folder,
    public_id: options.publicId,
    resource_type: "image",
    overwrite: true,
  });
  return {
    publicId: res.public_id,
    secureUrl: res.secure_url,
    width: res.width,
    height: res.height,
    format: res.format,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  const client = ensureConfigured();
  try {
    const result = await client.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
    if (result.result !== "ok" && result.result !== "not found") {
      logger.error("Cloudinary delete failed", { result });
      throw new HttpError(502, `Media provider deletion failed: ${result.result || "Unknown error"}`);
    }
  } catch (error) {
    if (error instanceof HttpError) throw error;
    logger.error("Cloudinary delete exception", { error });
    const rawMessage = error && typeof error === "object" && "message" in error ? String((error as { message: unknown }).message) : "";
    throw new HttpError(502, rawMessage ? `Media provider deletion failed: ${rawMessage}` : "Media provider deletion failed");
  }
}

export interface VideoSignatureResult {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

/**
 * Generate a cryptographically signed signature for direct-to-Cloudinary video upload.
 * Prevents routing large video binaries through the Node/Express server and avoiding Render timeouts.
 */
export function generateVideoUploadSignature(folder = "yumnest/videos"): VideoSignatureResult {
  const env = loadEnvironment();
  if (!isCloudinaryConfigured()) throw new HttpError(503, "Media service is not configured");
  const client = ensureConfigured();

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign: Record<string, string | number> = {
    folder,
    timestamp,
  };

  const signature = client.utils.api_sign_request(paramsToSign, env.CLOUDINARY_API_SECRET as string);

  return {
    signature,
    timestamp,
    apiKey: env.CLOUDINARY_API_KEY as string,
    cloudName: env.CLOUDINARY_CLOUD_NAME as string,
    folder,
  };
}

/**
 * Automatically generate an optimized Cloudinary video thumbnail poster URL.
 * Extracts a frame near the beginning of the video (default 1s offset) and delivers as auto-compressed JPG.
 */
export function generateVideoThumbnailUrl(
  publicId: string,
  options: { offsetSeconds?: number; width?: number; height?: number } = {}
): string {
  const client = ensureConfigured();
  const offset = options.offsetSeconds ?? 1;
  const width = options.width ?? 800;
  const height = options.height ?? 450;

  return client.url(publicId, {
    resource_type: "video",
    format: "jpg",
    transformation: [
      { start_offset: String(offset) },
      { width, height, crop: "fill", quality: "auto" },
    ],
    secure: true,
  });
}

export interface CloudinaryVideoUploadResult {
  publicId: string;
  assetId?: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  duration: number;
  bytes: number;
}

/**
 * Server-side fallback upload stream for video files.
 */
export function uploadVideo(
  buffer: Buffer,
  options: { folder?: string; publicId?: string } = {}
): Promise<CloudinaryVideoUploadResult> {
  const client = ensureConfigured();
  const folder = options.folder || "yumnest/videos";

  return new Promise<CloudinaryVideoUploadResult>((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        folder,
        public_id: options.publicId,
        resource_type: "video",
        overwrite: true,
        invalidate: true,
      },
      (error, result) => {
        if (error || !result) {
          logger.error("Cloudinary video upload failed", { error });
          const rawMessage =
            error && typeof error === "object" && "message" in error
              ? String((error as { message: unknown }).message)
              : "";
          reject(new HttpError(502, rawMessage ? `Video upload failed: ${rawMessage}` : "Video upload failed"));
          return;
        }

        resolve({
          publicId: result.public_id,
          assetId: result.asset_id,
          secureUrl: result.secure_url,
          width: result.width || 1280,
          height: result.height || 720,
          format: result.format || "mp4",
          duration: typeof result.duration === "number" ? result.duration : 0,
          bytes: result.bytes || 0,
        });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Safely delete a video asset from Cloudinary.
 */
export async function deleteVideo(publicId: string): Promise<void> {
  const client = ensureConfigured();
  try {
    const result = await client.uploader.destroy(publicId, { resource_type: "video", invalidate: true });
    if (result.result !== "ok" && result.result !== "not found") {
      logger.error("Cloudinary video delete failed", { result });
      throw new HttpError(502, `Video asset deletion failed: ${result.result || "Unknown error"}`);
    }
  } catch (error) {
    if (error instanceof HttpError) throw error;
    logger.error("Cloudinary video delete exception", { error });
    const rawMessage =
      error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : "";
    throw new HttpError(502, rawMessage ? `Video deletion failed: ${rawMessage}` : "Video deletion failed");
  }
}
