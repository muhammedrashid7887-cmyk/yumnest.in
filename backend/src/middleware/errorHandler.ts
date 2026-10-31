import type { ErrorRequestHandler } from "express";
import { logger } from "../utils/logger";
import { isDuplicateKeyError } from "../utils/mongo";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const isMulterError = error?.name === "MulterError";
  const statusCode = isDuplicateKeyError(error) ? 409 : error?.name === "CastError" ? 400 : isMulterError ? (error.code === "LIMIT_FILE_SIZE" ? 413 : 400) : typeof error.statusCode === "number" ? error.statusCode : 500;
  const isOperational = statusCode >= 400 && statusCode < 500;

  logger.error("Unhandled request error", { statusCode });

  response.status(statusCode).json({
    success: false,
    error: {
      code: isDuplicateKeyError(error) ? "DUPLICATE_RESOURCE" : error?.name === "CastError" ? "INVALID_RESOURCE_ID" : isMulterError ? "INVALID_MEDIA_UPLOAD" : isOperational ? "REQUEST_ERROR" : "INTERNAL_SERVER_ERROR",
      message: isDuplicateKeyError(error) ? "A resource with the same unique value already exists" : error?.name === "CastError" ? "Invalid resource identifier" : isMulterError ? (error.code === "LIMIT_FILE_SIZE" ? "Image exceeds the 5 MB limit" : "Invalid media upload") : isOperational && typeof error.message === "string" ? error.message : "An unexpected error occurred",
    },
  });
};
