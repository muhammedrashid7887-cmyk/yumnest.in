import { Types } from "mongoose";
import { HttpError } from "./httpError";

export function objectId(value: string, field = "id"): Types.ObjectId {
  if (!Types.ObjectId.isValid(value)) throw new HttpError(400, `Invalid ${field}`);
  return new Types.ObjectId(value);
}

export function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: number }).code === 11000;
}
