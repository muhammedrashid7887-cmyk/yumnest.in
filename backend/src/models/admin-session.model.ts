import { Schema, model, type Types } from "mongoose";

export interface AdminSession {
  adminId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  lastUsedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const adminSessionSchema = new Schema<AdminSession>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    expiresAt: { type: Date, required: true },
    lastUsedAt: { type: Date, required: true },
    ipAddress: { type: String, maxlength: 64 },
    userAgent: { type: String, maxlength: 512 },
  },
  { timestamps: true }
);

adminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
adminSessionSchema.index({ adminId: 1, expiresAt: 1 });

export const AdminSessionModel = model<AdminSession>("AdminSession", adminSessionSchema);
