import type { RequestHandler } from "express";
import type { z } from "zod";
import { HttpError } from "../utils/httpError";

export function validateBody(schema: z.ZodType): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const message = firstIssue ? firstIssue.message : "Invalid request body";
      next(new HttpError(400, message, "VALIDATION_ERROR"));
      return;
    }

    request.body = result.data;
    next();
  };
}
