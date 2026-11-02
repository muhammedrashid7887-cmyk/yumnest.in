import type { RequestHandler } from "express";
import type { z } from "zod";
import { HttpError } from "../utils/httpError";

export function validateParams(schema: z.ZodType): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.params);
    if (!result.success) {
      next(new HttpError(400, "Invalid route parameters"));
      return;
    }
    request.params = result.data as typeof request.params;
    next();
  };
}
