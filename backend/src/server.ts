import { createServer, type Server as HttpServer } from "node:http";
import { createApp } from "./app";
import { connectToDatabase, disconnectFromDatabase } from "./config/database";
import { loadEnvironment } from "./config/env";
import { bootstrapAdminAccount } from "./services/auth.service";
import { initSocketService, closeSocketService } from "./services/socket.service";
import { logger } from "./utils/logger";

let httpServer: HttpServer | undefined;
let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info("Graceful shutdown started", { signal });

  try {
    await closeSocketService();
  } catch (error) {
    logger.warn("Error closing socket service during shutdown", { error });
  }

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
  await bootstrapAdminAccount(env);

  const app = createApp(env);
  httpServer = createServer(app);

  // Initialize Socket.IO real-time engine
  initSocketService(httpServer, env);

  httpServer.listen(env.PORT, "0.0.0.0", () => {
    logger.info("Yumnest API & Socket.IO running", {
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
