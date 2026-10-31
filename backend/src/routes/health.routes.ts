import { Router } from "express";
import { getDatabaseStatus } from "../config/database";

export const healthRouter = Router();

healthRouter.get("/health", (_request, response) => {
  const database = getDatabaseStatus();
  const isConnected = database === "connected";

  response.status(isConnected ? 200 : 503).json({
    success: isConnected,
    message: isConnected ? "Yumnest API is running" : "Yumnest API is unavailable",
    data: {
      api: isConnected ? "healthy" : "unavailable",
      database: isConnected ? "connected" : "disconnected",
    },
  });
});
