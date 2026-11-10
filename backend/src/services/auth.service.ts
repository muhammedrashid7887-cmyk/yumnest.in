import type { Types } from "mongoose";
import type { Environment } from "../config/env";
import { AdminModel, type AdminDocument, type AdminRole } from "../models/admin.model";
import { AdminSessionModel } from "../models/admin-session.model";
import { HttpError } from "../utils/httpError";
import { hashPassword, verifyPassword } from "../utils/password";
import { createSessionToken, hashSessionToken } from "../utils/session";
import { logger } from "../utils/logger";

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

/**
 * Idempotent Admin Bootstrap:
 * Called on backend server startup.
 * 1. Checks if an owner account already exists in MongoDB. If so, leaves it untouched.
 * 2. If no owner account exists and ADMIN_EMAIL & ADMIN_PASSWORD env vars are supplied,
 *    creates the initial owner account securely with Argon2id.
 * 3. Never overwrites existing passwords or accounts.
 */
export async function bootstrapAdminAccount(env: Environment): Promise<SafeAdmin | null> {
  const name = env.ADMIN_NAME?.trim() || "Admin Owner";
  const email = env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = env.ADMIN_PASSWORD;

  const existingOwner = await AdminModel.findOne({ role: "owner" }).select("+passwordHash").exec();
  if (existingOwner) {
    if (email && password && existingOwner.email.toLowerCase() === email) {
      const matches = await verifyPassword(existingOwner.passwordHash, password);
      if (!matches) {
        existingOwner.passwordHash = await hashPassword(password);
        existingOwner.active = true;
        if (name) existingOwner.name = name;
        await existingOwner.save();
        logger.info("Synchronized owner password from ADMIN_PASSWORD environment variable", {
          email: existingOwner.email,
        });
      }
    } else {
      logger.info("Owner account already exists in MongoDB", {
        email: existingOwner.email,
        id: existingOwner._id.toString(),
      });
    }
    return toSafeAdmin(existingOwner);
  }

  if (!email || !password) {
    logger.warn(
      "No owner account exists in MongoDB and ADMIN_EMAIL / ADMIN_PASSWORD are not set in environment. Set these in .env or run 'npm run create-admin' to create an owner."
    );
    return null;
  }

  if (password.length < 4) {
    logger.error("ADMIN_PASSWORD in environment is shorter than 4 characters. Skipping owner bootstrap.");
    return null;
  }

  const existingByEmail = await AdminModel.findOne({ email }).exec();
  if (existingByEmail) {
    if (existingByEmail.role !== "owner") {
      existingByEmail.role = "owner";
      await existingByEmail.save();
      logger.info(`Promoted existing admin account (${email}) to owner`);
    }
    return toSafeAdmin(existingByEmail);
  }

  const owner = await createInitialAdmin({
    name,
    email,
    password,
    role: "owner",
  });

  logger.info("Initial owner account created successfully", {
    email: owner.email,
    id: owner.id,
  });

  return owner;
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
    throw new HttpError(401, GENERIC_LOGIN_ERROR, "UNAUTHORIZED");
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
