import { connectToDatabase, disconnectFromDatabase } from "../config/database";
import { loadEnvironment } from "../config/env";
import { seedInitialMediaItems } from "../services/media-item.service";
import { MediaItemModel } from "../models/media-item.model";

async function main() {
  console.log("Seeding initial media items...");
  const env = loadEnvironment();
  await connectToDatabase(env.MONGODB_URI);
  await seedInitialMediaItems();
  const count = await MediaItemModel.countDocuments();
  console.log(`Media items in MongoDB: ${count}`);
  await disconnectFromDatabase();
  console.log("Done.");
}

main().catch(console.error);

