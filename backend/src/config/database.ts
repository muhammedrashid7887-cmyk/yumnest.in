import mongoose from "mongoose";
import { logger } from "../utils/logger";

export type DatabaseStatus = "connected" | "connecting" | "disconnecting" | "disconnected";

function currentDatabaseStatus(): DatabaseStatus {
  switch (mongoose.connection.readyState) {
    case mongoose.ConnectionStates.connected:
      return "connected";
    case mongoose.ConnectionStates.connecting:
      return "connecting";
    case mongoose.ConnectionStates.disconnecting:
      return "disconnecting";
    default:
      return "disconnected";
  }
}

mongoose.connection.on("connected", () => {
  logger.info("MongoDB connection established");
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB connection disconnected");
});

mongoose.connection.on("error", () => {
  logger.error("MongoDB connection error");
});

export async function connectToDatabase(mongoUri: string): Promise<void> {
  if (currentDatabaseStatus() === "connected") return;

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10_000,
    connectTimeoutMS: 10_000,
  });
}

export function getDatabaseStatus(): DatabaseStatus {
  return currentDatabaseStatus();
}

export async function disconnectFromDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== mongoose.ConnectionStates.disconnected) {
    await mongoose.disconnect();
  }
}
