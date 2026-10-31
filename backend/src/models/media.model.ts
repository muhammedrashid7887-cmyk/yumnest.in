import { Schema, model, type Types } from "mongoose";

export const MEDIA_FOLDERS = ["products", "categories"] as const;
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

export interface Media {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  originalFilename: string;
  altText?: string;
  folder: MediaFolder;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema<Media>(
  {
    publicId: { type: String, required: true, unique: true, trim: true },
    secureUrl: { type: String, required: true, trim: true },
    width: { type: Number, required: true, min: 1 },
    height: { type: Number, required: true, min: 1 },
    format: { type: String, required: true, lowercase: true },
    bytes: { type: Number, required: true, min: 1 },
    originalFilename: { type: String, required: true, maxlength: 255 },
    altText: { type: String, trim: true, maxlength: 200 },
    folder: { type: String, enum: MEDIA_FOLDERS, required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
  },
  { timestamps: true }
);

mediaSchema.index({ createdAt: -1 });

export const MediaModel = model<Media>("Media", mediaSchema);
