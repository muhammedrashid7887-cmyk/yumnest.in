import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "./password";
import { createSessionToken, hashSessionToken } from "./session";

async function run(): Promise<void> {
  const hash = await hashPassword("correct horse battery staple");

  assert.match(hash, /^\$argon2id\$/);
  assert.equal(await verifyPassword(hash, "correct horse battery staple"), true);
  assert.equal(await verifyPassword(hash, "incorrect password"), false);
  assert.notEqual(hash, "correct horse battery staple");

  const firstToken = createSessionToken();
  const secondToken = createSessionToken();

  assert.equal(firstToken.length, 64);
  assert.notEqual(firstToken, secondToken);
  assert.equal(hashSessionToken(firstToken).length, 64);
  assert.notEqual(hashSessionToken(firstToken), firstToken);

  console.log("Authentication crypto checks passed");
}

void run().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
