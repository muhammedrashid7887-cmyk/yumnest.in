import { Schema, model, type HydratedDocument } from "mongoose";

export const ADMIN_ROLES = ["owner", "admin"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export interface Admin {
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type AdminDocument = HydratedDocument<Admin>;

const adminSchema = new Schema<Admin>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ADMIN_ROLES, required: true, default: "admin" },
    active: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_document, returned) => {
        const safeReturned = returned as Record<string, unknown>;
        delete safeReturned.passwordHash;
        delete safeReturned.__v;
        return safeReturned;
      },
    },
  }
);

export const AdminModel = model<Admin>("Admin", adminSchema);
