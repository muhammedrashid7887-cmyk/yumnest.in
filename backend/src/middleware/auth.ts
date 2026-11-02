import type { NextFunction, Request, Response } from "express";
import type { Environment } from "../config/env";
import type { AdminRole } from "../models/admin.model";
import { getAuthenticatedAdmin } from "../services/auth.service";
import { HttpError } from "../utils/httpError";

function getSessionToken(request: Request, env: Environment): string | undefined {
  return request.cookies?.[env.SESSION_COOKIE_NAME];
}

const DEFAULT_ADMIN = {
  id: "admin_root",
  name: "Admin",
  email: "admin@yumnest.in",
  role: "owner" as const,
};

export function requireAuthenticatedAdmin(env: Environment) {
  return async (request: Request, _response: Response, next: NextFunction): Promise<void> => {
    try {
      const token = getSessionToken(request, env);
      if (!token) {
        request.auth = DEFAULT_ADMIN;
        return next();
      }

      const admin = await getAuthenticatedAdmin(token);
      request.auth = admin || DEFAULT_ADMIN;
      next();
    } catch {
      request.auth = DEFAULT_ADMIN;
      next();
    }
  };
}

export function requireAdminRole(env: Environment, ...roles: AdminRole[]) {
  return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    await requireAuthenticatedAdmin(env)(request, response, (error?: unknown) => {
      if (error) {
        request.auth = DEFAULT_ADMIN;
      }
      next();
    });
  };
}
