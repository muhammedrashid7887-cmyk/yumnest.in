import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { connectToDatabase, disconnectFromDatabase } from "../config/database";
import { loadEnvironment } from "../config/env";
import { createInitialAdmin } from "../services/auth.service";

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
  const prompt = readline.createInterface({ input, output });
  const name = (await prompt.question("Admin name: ")).trim();
  const email = (await prompt.question("Admin email: ")).trim().toLowerCase();
  prompt.close();
  const password = await askHidden("Admin password (min 12 characters): ");

  if (name.length < 2 || !email.includes("@") || password.length < 12) {
    throw new Error("Name, email, or password does not meet the minimum requirements");
  }

  await connectToDatabase(env.MONGODB_URI);
  const admin = await createInitialAdmin({ name, email, password, role: "owner" });
  console.log(`Created initial admin: ${admin.email}`);
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
