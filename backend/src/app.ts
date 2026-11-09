import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import type { Environment } from "./config/env";
import { authRouter } from "./routes/auth.routes";
import { catalogueRouter } from "./routes/catalogue.routes";
import { mediaRouter } from "./routes/media.routes";
import { orderRouter } from "./routes/order.routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { healthRouter } from "./routes/health.routes";

export function createApp(env: Environment) {
  const app = express();

  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const allowedOrigins = env.FRONTEND_ORIGIN.split(",").map((o) => o.trim().replace(/\/$/, ""));
        const normalizedOrigin = origin.replace(/\/$/, "");
        if (
          allowedOrigins.includes(normalizedOrigin) ||
          (env.NODE_ENV === "development" && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
        ) {
          return callback(null, true);
        }
        callback(null, false);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());

  app.use(healthRouter);
  app.use("/auth", authRouter(env));
  app.use("/api", catalogueRouter(env));
  app.use("/api/v1", catalogueRouter(env));
  app.use("/api", mediaRouter(env));
  app.use("/api/v1", mediaRouter(env));
  app.use("/api", orderRouter(env));
  app.use("/api/v1", orderRouter(env));
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
