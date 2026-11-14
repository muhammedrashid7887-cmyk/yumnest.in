import { connectToDatabase, disconnectFromDatabase } from "../config/database";
import { loadEnvironment } from "../config/env";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

async function backup() {
  const env = loadEnvironment();
  await connectToDatabase(env.MONGODB_URI);
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection not ready");
  }

  const media_items = await db.collection("media_items").find({}).toArray();
  const videos = await db.collection("videos").find({}).toArray();

  const backupData = {
    timestamp: new Date().toISOString(),
    sourceCollections: {
      media_items: media_items.length,
      videos: videos.length,
    },
    media_items,
    videos,
  };

  const backupDir = path.resolve("./backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFile = path.join(backupDir, "media_backup_2026_11_14.json");
  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), "utf8");
  console.log("Backup written successfully to:", backupFile);
  console.log(` - media_items backed up: ${media_items.length} records`);
  console.log(` - videos backed up: ${videos.length} records`);

  await disconnectFromDatabase();
}

backup().catch(console.error);
