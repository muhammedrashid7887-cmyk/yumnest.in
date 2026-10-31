import type { NextFunction, Request, Response } from "express";
import type { Environment } from "../config/env";
import type { AdminRole } from "../models/admin.model";
import { getAuthenticatedAdmin } from "../services/auth.service";
import { HttpError } from "../utils/httpError";

function getSessionToken(request: Request, env: Environment): string | undefined {
  return request.cookies?.[env.SESSION_COOKIE_NAME];
}

export function requireAuthenticatedAdmin(env: Environment) {
  return async (request: Request, _response: Response, next: NextFunction): Promise<void> => {
    try {
      const token = getSessionToken(request, env);
      if (!token) throw new HttpError(401, "Authentication required");

      const admin = await getAuthenticatedAdmin(token);
      if (!admin) throw new HttpError(401, "Authentication required");

      request.auth = admin;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireAdminRole(env: Environment, ...roles: AdminRole[]) {
  return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    await requireAuthenticatedAdmin(env)(request, response, (error?: unknown) => {
      if (error) {
        next(error);
        return;
      }

      if (!request.auth || !roles.includes(request.auth.role)) {
        next(new HttpError(403, "Insufficient permissions"));
        return;
      }

      next();
    });
  };
}
