import type { Server } from "node:http";
import { createApp } from "./app";
import { connectToDatabase, disconnectFromDatabase } from "./config/database";
import { loadEnvironment } from "./config/env";
import { logger } from "./utils/logger";

let httpServer: Server | undefined;
let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info("Graceful shutdown started", { signal });

  await new Promise<void>((resolve, reject) => {
    if (!httpServer) {
      resolve();
      return;
    }

    httpServer.close((error) => (error ? reject(error) : resolve()));
  });

  await disconnectFromDatabase();
  logger.info("Graceful shutdown completed");
}

async function startServer(): Promise<void> {
  const env = loadEnvironment();
  await connectToDatabase(env.MONGODB_URI);

  httpServer = createApp(env).listen(env.PORT, () => {
    logger.info("Yumnest API is running", {
      port: env.PORT,
      environment: env.NODE_ENV,
    });
  });
}

process.on("SIGINT", () => {
  void shutdown("SIGINT").then(() => process.exit(0)).catch(() => process.exit(1));
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM").then(() => process.exit(0)).catch(() => process.exit(1));
});

void startServer().catch(async (error: unknown) => {
  const reason = error instanceof Error && error.message.startsWith("Invalid environment configuration")
    ? error.message
    : "Database connection or server startup failed";
  logger.error("Yumnest API failed to start", { reason });
  await disconnectFromDatabase();
  process.exit(1);
});
