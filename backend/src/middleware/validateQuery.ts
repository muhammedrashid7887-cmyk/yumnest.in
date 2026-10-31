import type { RequestHandler } from "express";
import type { z } from "zod";
import { HttpError } from "../utils/httpError";

export function validateQuery(schema: z.ZodType): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.query);
    if (!result.success) {
      next(new HttpError(400, "Invalid query parameters"));
      return;
    }
    request.query = result.data as typeof request.query;
    next();
  };
}
