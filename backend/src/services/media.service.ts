import path from "node:path";
import { randomUUID } from "node:crypto";
import { Types } from "mongoose";
import sharp from "sharp";
import { deleteImage, uploadImage } from "../config/cloudinary";
import { AdminModel } from "../models/admin.model";
import { CategoryModel } from "../models/category.model";
import { MediaModel, type MediaFolder } from "../models/media.model";
import { ProductModel } from "../models/product.model";
import { HttpError } from "../utils/httpError";
import { objectId } from "../utils/mongo";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_DIMENSION = 5_000;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "avif"]);

export interface UploadFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

export async function uploadMedia(files: UploadFile[], input: { folder: MediaFolder; altText?: string }, adminId: string) {
  if (files.length === 0) throw new HttpError(400, "At least one image file is required");
  if (files.length > 10) throw new HttpError(400, "A maximum of 10 images may be uploaded at once");

  const uploaded = [];
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) throw new HttpError(413, "Image exceeds the 5 MB limit");
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) throw new HttpError(415, "Unsupported image format");

    let metadata: sharp.Metadata;
    try {
      metadata = await sharp(file.buffer, { failOn: "error" }).metadata();
    } catch {
      throw new HttpError(400, "Invalid image contents");
    }

    if (!metadata.format || !ALLOWED_FORMATS.has(metadata.format) || !metadata.width || !metadata.height) {
      throw new HttpError(415, "Unsupported or unreadable image format");
    }
    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
      throw new HttpError(413, "Image dimensions exceed the 5000 by 5000 limit");
    }

    const expectedMime = metadata.format === "jpeg" ? "image/jpeg" : `image/${metadata.format}`;
    if (file.mimetype !== expectedMime) throw new HttpError(415, "Image content does not match its MIME type");

    const result = await uploadImage(file.buffer, { folder: `yumnest/${input.folder}`, publicId: randomUUID() });
    const uploadedBy = Types.ObjectId.isValid(adminId)
      ? new Types.ObjectId(adminId)
      : (await AdminModel.findOne().select("_id").lean().exec())?._id || new Types.ObjectId("000000000000000000000001");

    const media = await MediaModel.create({
      ...result,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      originalFilename: path.basename(file.originalname).slice(0, 255),
      altText: input.altText,
      folder: input.folder,
      uploadedBy,
    });
    uploaded.push(media.toJSON());
  }
  return uploaded;
}

export async function listMedia(options: { page: number; limit: number; folder?: MediaFolder }) {
  const filter = options.folder ? { folder: options.folder } : {};
  const skip = (options.page - 1) * options.limit;
  const [items, total] = await Promise.all([
    MediaModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(options.limit).lean().exec(),
    MediaModel.countDocuments(filter).exec(),
  ]);
  return { items, total, page: options.page, limit: options.limit, pages: Math.ceil(total / options.limit) };
}

export async function deleteMedia(id: string): Promise<void> {
  const media = await MediaModel.findById(objectId(id, "media id")).exec();
  if (!media) throw new HttpError(404, "Media not found");

  const mediaId = media._id.toString();
  const [productReference, categoryReference] = await Promise.all([
    ProductModel.exists({ "images.mediaId": mediaId }),
    CategoryModel.exists({ "image.mediaId": mediaId }),
  ]);
  if (productReference || categoryReference) throw new HttpError(409, "Media is referenced by catalogue content");

  await deleteImage(media.publicId);
  await media.deleteOne();
}
