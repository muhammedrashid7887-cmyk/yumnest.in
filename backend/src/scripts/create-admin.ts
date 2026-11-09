import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { connectToDatabase, disconnectFromDatabase } from "../config/database";
import { loadEnvironment } from "../config/env";
import { AdminModel } from "../models/admin.model";
import { createInitialAdmin } from "../services/auth.service";
import { hashPassword } from "../utils/password";

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;
    process.stdout.write(question);
    stdin.setRawMode?.(true);
    stdin.resume();
    let value = "";

    const onData = (chunk: Buffer) => {
      const character = chunk.toString("utf8");
      if (character === "\u0003") process.exit(1);
      if (character === "\r" || character === "\n") {
        stdin.setRawMode?.(wasRaw ?? false);
        stdin.pause();
        stdin.off("data", onData);
        process.stdout.write("\n");
        resolve(value);
        return;
      }
      if (character === "\u007f") {
        value = value.slice(0, -1);
        return;
      }
      value += character;
    };

    stdin.on("data", onData);
  });
}

async function main(): Promise<void> {
  const env = loadEnvironment();
  await connectToDatabase(env.MONGODB_URI);

  // 1. Obtain credentials from environment variables or interactive prompt
  let name = env.ADMIN_NAME ?? process.env.ADMIN_NAME?.trim();
  let email = env.ADMIN_EMAIL ?? process.env.ADMIN_EMAIL?.trim().toLowerCase();
  let password = env.ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    if (process.stdin.isTTY) {
      const prompt = readline.createInterface({ input, output });
      if (!name) name = (await prompt.question("Admin name: ")).trim();
      if (!email) email = (await prompt.question("Admin email: ")).trim().toLowerCase();
      prompt.close();
      if (!password) password = await askHidden("Admin password: ");
    } else {
      throw new Error(
        "Missing owner credentials. In non-interactive environments, please set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in backend/.env."
      );
    }
  }

  // 2. Validation
  if (name.length < 2 || !email.includes("@") || password.length < 4) {
    throw new Error(
      "Validation failure: Admin name must be >= 2 characters, email must be valid, and password must be >= 4 characters."
    );
  }

  // 3. Check if owner already exists -> update password
  const existingOwner = await AdminModel.findOne({ role: "owner" });
  if (existingOwner) {
    console.log(
      `[Bootstrap] An owner account already exists in MongoDB: ${existingOwner.email} (ID: ${existingOwner._id}).`
    );
    existingOwner.passwordHash = await hashPassword(password);
    if (name) existingOwner.name = name;
    if (email) existingOwner.email = email;
    existingOwner.active = true;
    await existingOwner.save();
    console.log(`[Bootstrap] Successfully updated password to '${password}' for owner: ${existingOwner.email}`);
    return;
  }

  // 4. Create owner with Argon2id hash
  const admin = await createInitialAdmin({ name, email, password, role: "owner" });
  console.log(`[Bootstrap] Successfully created initial owner account: ${admin.email}`);
}

void main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unable to create initial admin";
    console.error(message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectFromDatabase();
  });
