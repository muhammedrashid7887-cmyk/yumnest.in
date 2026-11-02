import type { Request, Response } from "express";

export function notFound(_request: Request, response: Response): void {
  response.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
}
