import { connectToDatabase, disconnectFromDatabase } from "../config/database";
import { loadEnvironment } from "../config/env";
import mongoose from "mongoose";

async function inspect() {
  const env = loadEnvironment();
  await connectToDatabase(env.MONGODB_URI);
  const db = mongoose.connection.db;
  if (!db) {
    console.error("Database connection failed");
    return;
  }
  const collections = await db.listCollections().toArray();
  console.log("=== MONGODB COLLECTIONS ===");
  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(` - ${c.name}: ${count} documents`);
  }

  // Inspect media_items
  if (collections.some((c) => c.name === "media_items")) {
    const items = await db.collection("media_items").find({}).toArray();
    console.log(`\n=== media_items collection (${items.length} records) ===`);
    console.log(JSON.stringify(items, null, 2));
  } else {
    console.log("\nCollection 'media_items' does not exist.");
  }

  // Inspect videos
  if (collections.some((c) => c.name === "videos")) {
    const vids = await db.collection("videos").find({}).toArray();
    console.log(`\n=== videos collection (${vids.length} records) ===`);
    console.log(JSON.stringify(vids, null, 2));
  } else {
    console.log("\nCollection 'videos' does not exist.");
  }

  // Inspect media
  if (collections.some((c) => c.name === "media")) {
    const mediaCount = await db.collection("media").countDocuments();
    console.log(`\n=== media collection (image library) count: ${mediaCount} ===`);
  }

  await disconnectFromDatabase();
  console.log("\nInspection complete.");
}

inspect().catch(console.error);
