import type { RequestHandler } from "express";
import type { z } from "zod";
import { HttpError } from "../utils/httpError";

export function validateBody(schema: z.ZodType): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      next(new HttpError(400, "Invalid request body"));
      return;
    }

    request.body = result.data;
    next();
  };
}
