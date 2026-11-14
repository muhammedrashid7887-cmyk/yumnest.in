import { Schema, model, type Document, type Types } from "mongoose";

export interface IVideo {
  title: string;
  description: string;
  cloudinaryPublicId: string;
  cloudinaryAssetId?: string;
  videoUrl: string;
  thumbnailUrl: string;
  customThumbnailUrl?: string;
  duration: number; // Duration in seconds
  durationFormatted: string; // "MM:SS" or "HH:MM:SS"
  format: string; // e.g. "mp4", "webm"
  width: number;
  height: number;
  fileSize: number; // in bytes
  category: string;
  isPublished: boolean;
  displayOrder: number;
  instagramSourceUrl?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type VideoDocument = IVideo & Document;

const videoSchema = new Schema<IVideo>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
      index: "text",
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    cloudinaryAssetId: {
      type: String,
      trim: true,
    },
    videoUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
    thumbnailUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
    customThumbnailUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
    },
    duration: {
      type: Number,
      default: 0,
    },
    durationFormatted: {
      type: String,
      default: "00:00",
      trim: true,
      maxlength: 20,
    },
    format: {
      type: String,
      default: "mp4",
      lowercase: true,
      trim: true,
      maxlength: 20,
    },
    width: {
      type: Number,
      default: 1280,
    },
    height: {
      type: Number,
      default: 720,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: false,
      default: "General",
      trim: true,
      maxlength: 100,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    instagramSourceUrl: {
      type: String,
      trim: true,
      maxlength: 1024,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
    collection: "videos",
  }
);

// Compound indexes for optimal storefront query performance
videoSchema.index({ isPublished: 1, displayOrder: 1, createdAt: -1 });
videoSchema.index({ category: 1, isPublished: 1 });

export const VideoModel = model<IVideo>("Video", videoSchema);
