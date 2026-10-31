import assert from "node:assert/strict";
import { uploadMedia } from "../services/media.service";

const png1x1 = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");

async function expectStatus(action: Promise<unknown>, statusCode: number): Promise<void> {
  await assert.rejects(action, (error: unknown) => {
    assert.equal((error as { statusCode?: number }).statusCode, statusCode);
    return true;
  });
}

async function run(): Promise<void> {
await expectStatus(
  uploadMedia([{ buffer: Buffer.from("bad"), mimetype: "application/javascript", originalname: "x.js", size: 3 }], { folder: "products" }, "507f1f77bcf86cd799439011"),
  415
);
await expectStatus(
  uploadMedia([{ buffer: Buffer.alloc(5 * 1024 * 1024 + 1), mimetype: "image/png", originalname: "large.png", size: 5 * 1024 * 1024 + 1 }], { folder: "products" }, "507f1f77bcf86cd799439011"),
  413
);
await expectStatus(
  uploadMedia([{ buffer: Buffer.from("not an image"), mimetype: "image/png", originalname: "invalid.png", size: 12 }], { folder: "products" }, "507f1f77bcf86cd799439011"),
  400
);
await expectStatus(
  uploadMedia([{ buffer: png1x1, mimetype: "image/png", originalname: "valid.png", size: png1x1.length }], { folder: "products" }, "507f1f77bcf86cd799439011"),
  503
);

console.log("Media validation checks passed; Cloudinary upload correctly requires configuration");
}

void run().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
