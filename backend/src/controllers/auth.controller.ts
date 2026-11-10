import type { Request, Response } from "express";
import type { Environment } from "../config/env";
import { deleteAdminSession, loginAdmin } from "../services/auth.service";
import { HttpError } from "../utils/httpError";

function sessionCookieOptions(env: Environment, maxAge?: number) {
  const isProd = env.NODE_ENV === "production";
  const sameSite = isProd ? ("none" as const) : env.SESSION_COOKIE_SAME_SITE;
  const secure = isProd || sameSite === "none" ? true : env.SESSION_COOKIE_SECURE;

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    ...(maxAge === undefined ? {} : { maxAge }),
  } as const;
}

function getToken(request: Request, env: Environment): string | undefined {
  return request.cookies?.[env.SESSION_COOKIE_NAME];
}

export function createAuthController(env: Environment) {
  const login = async (request: Request, response: Response): Promise<void> => {
    const { email, password } = request.body as { email: string; password: string };
    const result = await loginAdmin(
      email,
      password,
      {
        ipAddress: request.ip,
        userAgent: request.get("user-agent")?.slice(0, 512),
      },
      env.SESSION_TTL_DAYS
    );

    response.cookie(
      env.SESSION_COOKIE_NAME,
      result.token,
      sessionCookieOptions(env, env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
    );
    response.status(200).json({
      success: true,
      data: {
        admin: result.admin,
        token: result.token,
        expiresAt: result.expiresAt,
      },
    });
  };

  const logout = async (request: Request, response: Response): Promise<void> => {
    const token = getToken(request, env);
    if (token) {
      await deleteAdminSession(token);
    }

    response.clearCookie(env.SESSION_COOKIE_NAME, sessionCookieOptions(env));
    response.status(200).json({ success: true, data: { loggedOut: true } });
  };

  const me = async (request: Request, response: Response): Promise<void> => {
    if (!request.auth) {
      throw new HttpError(401, "Authentication required", "UNAUTHORIZED");
    }

    response.status(200).json({ success: true, data: { admin: request.auth } });
  };

  return { login, logout, me };
}
