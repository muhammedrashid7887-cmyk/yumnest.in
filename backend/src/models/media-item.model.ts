import { Schema, model, type Document, type Types } from "mongoose";

export const MEDIA_PLATFORMS = ["youtube", "instagram"] as const;
export type MediaPlatform = (typeof MEDIA_PLATFORMS)[number];

export const MEDIA_STATUSES = ["draft", "published", "archived"] as const;
export type MediaStatus = (typeof MEDIA_STATUSES)[number];

export interface IMediaItem {
  platform: MediaPlatform;
  url: string;
  externalId: string;
  title: string;
  titleMl?: string;
  description: string;
  descriptionMl?: string;
  category: string;
  thumbnailUrl?: string;
  cloudinaryPublicId?: string;
  duration?: string;
  status: MediaStatus;
  featured: boolean;
  displayOrder: number;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type MediaItemDocument = IMediaItem & Document;

const mediaItemSchema = new Schema<IMediaItem>(
  {
    platform: {
      type: String,
      enum: MEDIA_PLATFORMS,
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1024,
    },
    externalId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
      index: "text",
    },
    titleMl: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    descriptionMl: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
    },
    cloudinaryPublicId: {
      type: String,
      trim: true,
      maxlength: 512,
    },
    duration: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    status: {
      type: String,
      enum: MEDIA_STATUSES,
      default: "published",
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
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
    collection: "media_items",
  }
);

// Compound index for efficient storefront querying of published items ordered by displayOrder
mediaItemSchema.index({ status: 1, displayOrder: 1, createdAt: -1 });
mediaItemSchema.index({ platform: 1, status: 1 });

export const MediaItemModel = model<IMediaItem>("MediaItem", mediaItemSchema);

