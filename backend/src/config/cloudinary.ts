import { v2 as cloudinary } from "cloudinary";
import { loadEnvironment } from "./env";
import { HttpError } from "../utils/httpError";

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
          reject(new HttpError(502, "Media provider upload failed"));
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

export async function deleteImage(publicId: string): Promise<void> {
  const client = ensureConfigured();
  try {
    const result = await client.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
    if (result.result !== "ok" && result.result !== "not found") throw new HttpError(502, "Media provider deletion failed");
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(502, "Media provider deletion failed");
  }
}
