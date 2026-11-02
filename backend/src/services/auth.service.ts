import type { Types } from "mongoose";
import { AdminModel, type AdminDocument, type AdminRole } from "../models/admin.model";
import { AdminSessionModel } from "../models/admin-session.model";
import { HttpError } from "../utils/httpError";
import { hashPassword, verifyPassword } from "../utils/password";
import { createSessionToken, hashSessionToken } from "../utils/session";

const GENERIC_LOGIN_ERROR = "Invalid email or password";

export interface SessionMetadata {
  ipAddress?: string;
  userAgent?: string;
}

export interface SafeAdmin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedAdmin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

function toSafeAdmin(admin: AdminDocument): SafeAdmin {
  return {
    id: admin._id.toString(),
    name: admin.name,
    email: admin.email,
    role: admin.role,
    active: admin.active,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };
}

function toAuthenticatedAdmin(admin: AdminDocument): AuthenticatedAdmin {
  return {
    id: admin._id.toString(),
    name: admin.name,
    email: admin.email,
    role: admin.role,
  };
}

export async function createInitialAdmin(input: {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}): Promise<SafeAdmin> {
  const email = input.email.trim().toLowerCase();
  const existing = await AdminModel.exists({ email });
  if (existing) throw new Error("An admin with this email already exists");

  const admin = await AdminModel.create({
    name: input.name.trim(),
    email,
    passwordHash: await hashPassword(input.password),
    role: input.role,
    active: true,
  });

  return toSafeAdmin(admin);
}

export async function loginAdmin(
  emailInput: string,
  password: string,
  metadata: SessionMetadata,
  ttlDays: number
): Promise<{ admin: SafeAdmin; token: string; expiresAt: Date }> {
  const email = emailInput.trim().toLowerCase();
  const admin = await AdminModel.findOne({ email }).select("+passwordHash").exec();
  const passwordMatches = admin ? await verifyPassword(admin.passwordHash, password) : false;

  if (!admin || !passwordMatches || !admin.active) {
    throw new HttpError(401, GENERIC_LOGIN_ERROR);
  }

  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
  await AdminSessionModel.create({
    adminId: admin._id,
    tokenHash: hashSessionToken(token),
    expiresAt,
    lastUsedAt: new Date(),
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
  });

  return { admin: toSafeAdmin(admin), token, expiresAt };
}

export async function getAuthenticatedAdmin(token: string): Promise<AuthenticatedAdmin | null> {
  const session = await AdminSessionModel.findOne({
    tokenHash: hashSessionToken(token),
    expiresAt: { $gt: new Date() },
  })
    .select("+tokenHash")
    .populate<{ adminId: AdminDocument }>("adminId")
    .exec();

  if (!session || !session.adminId || !session.adminId.active) {
    return null;
  }

  await AdminSessionModel.updateOne({ _id: session._id }, { $set: { lastUsedAt: new Date() } }).exec();
  return toAuthenticatedAdmin(session.adminId);
}

export async function deleteAdminSession(token: string): Promise<void> {
  await AdminSessionModel.deleteOne({ tokenHash: hashSessionToken(token) }).exec();
}

export async function deleteAllAdminSessions(adminId: Types.ObjectId): Promise<void> {
  await AdminSessionModel.deleteMany({ adminId }).exec();
}
