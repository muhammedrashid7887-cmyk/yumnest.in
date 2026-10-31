import { Router } from "express";
import rateLimit from "express-rate-limit";
import type { Environment } from "../config/env";
import { createAuthController } from "../controllers/auth.controller";
import { requireAuthenticatedAdmin } from "../middleware/auth";
import { validateBody } from "../middleware/validateBody";
import { loginSchema } from "../validators/auth.validators";

export function authRouter(env: Environment): Router {
  const router = Router();
  const controller = createAuthController(env);
  const loginLimiter = rateLimit({
    windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
    limit: env.AUTH_RATE_LIMIT_MAX,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, error: { code: "RATE_LIMITED", message: "Too many login attempts" } },
  });

  router.post("/login", loginLimiter, validateBody(loginSchema), controller.login);
  router.post("/logout", controller.logout);
  router.get("/me", requireAuthenticatedAdmin(env), controller.me);

  return router;
}
