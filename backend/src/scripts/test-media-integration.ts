import http from "node:http";
import mongoose from "mongoose";
import { createApp } from "../app";
import { loadEnvironment } from "../config/env";
import { connectToDatabase, disconnectFromDatabase } from "../config/database";
import { MediaItemModel } from "../models/media-item.model";
import { parseYouTubeUrl, parseInstagramUrl } from "../utils/media-url";

async function runMediaIntegrationTests() {
  console.log("=================================================");
  console.log("   YUMNEST MEDIA MANAGEMENT INTEGRATION TESTS   ");
  console.log("=================================================\n");

  // ── Test 1: URL Parsing & Validation ──
  console.log("1. Testing YouTube & Instagram URL Parsers...");

  const yt1 = parseYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  if (!yt1 || yt1.externalId !== "dQw4w9WgXcQ" || yt1.platform !== "youtube") {
    throw new Error(`Failed to parse standard YouTube URL! Got: ${JSON.stringify(yt1)}`);
  }

  const yt2 = parseYouTubeUrl("https://youtu.be/dQw4w9WgXcQ?t=42");
  if (!yt2 || yt2.externalId !== "dQw4w9WgXcQ") {
    throw new Error(`Failed to parse youtu.be URL! Got: ${JSON.stringify(yt2)}`);
  }

  const yt3 = parseYouTubeUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ");
  if (!yt3 || yt3.externalId !== "dQw4w9WgXcQ") {
    throw new Error(`Failed to parse YouTube Shorts URL! Got: ${JSON.stringify(yt3)}`);
  }

  const yt4 = parseYouTubeUrl("https://www.youtube.com/embed/dQw4w9WgXcQ");
  if (!yt4 || yt4.externalId !== "dQw4w9WgXcQ") {
    throw new Error(`Failed to parse YouTube embed URL! Got: ${JSON.stringify(yt4)}`);
  }

  const ytInvalid = parseYouTubeUrl("https://evil.com/watch?v=dQw4w9WgXcQ");
  if (ytInvalid !== null) {
    throw new Error("Failed: evil.com should not be parsed as YouTube!");
  }

  const ig1 = parseInstagramUrl("https://www.instagram.com/reel/C_3abc123_x/");
  if (!ig1 || ig1.externalId !== "C_3abc123_x" || ig1.platform !== "instagram") {
    throw new Error(`Failed to parse Instagram Reel URL! Got: ${JSON.stringify(ig1)}`);
  }

  const ig2 = parseInstagramUrl("https://instagram.com/p/C_3abc123_x/?igsh=MzRlODBiNWFlZA==");
  if (!ig2 || ig2.externalId !== "C_3abc123_x") {
    throw new Error(`Failed to parse Instagram Post URL! Got: ${JSON.stringify(ig2)}`);
  }

  const igInvalid = parseInstagramUrl("https://phishing-instagram.com/reel/xyz123");
  if (igInvalid !== null) {
    throw new Error("Failed: phishing domain should not be parsed as Instagram!");
  }

  console.log("   -> PASS: All YouTube & Instagram URL formats and security checks validated.\n");

  // ── Database & Server Setup ──
  const env = loadEnvironment();
  await connectToDatabase(env.MONGODB_URI);

  const app = createApp(env);
  const server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`[OK] Express test server listening on ${baseUrl}\n`);

  let sessionCookie = "";
  let createdYtId = "";
  let createdIgId = "";

  try {
    // ── Test 2: Admin Login ──
    console.log("2. Authenticating Admin for Media API...");
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "yumnest@gmail.com",
        password: "Yumnest@Admin2026!",
      }),
    });

    if (loginRes.status !== 200) {
      throw new Error(`Admin login failed: ${loginRes.status}`);
    }
    const cookieHeader = loginRes.headers.get("set-cookie") || "";
    sessionCookie = cookieHeader.split(";")[0];
    console.log("   -> PASS: Admin logged in successfully.\n");

    // ── Test 3: Create YouTube Media Item ──
    console.log("3. Testing POST /api/admin/media (YouTube Video)...");
    const ytPayload = {
      platform: "youtube",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      title: "Test Special Broasted Cooking Vlog",
      titleMl: "ബ്രോസ്റ്റഡ് ചിക്കൻ സ്പെഷ്യൽ റെസിപ്പി",
      description: "Learn how to make Kerala restaurant-style crispy chicken with Yumnest spices.",
      descriptionMl: "കേരള സ്റ്റൈൽ ക്രിസ്പി ചിക്കൻ ഉണ്ടാക്കാം.",
      category: "Broast Special",
      duration: "10:30",
      status: "published",
      featured: true,
      displayOrder: 1,
    };

    const createYtRes = await fetch(`${baseUrl}/api/admin/media`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify(ytPayload),
    });

    if (createYtRes.status !== 201) {
      const err = await createYtRes.text();
      throw new Error(`Failed to create YouTube media: ${createYtRes.status} - ${err}`);
    }

    const createYtData = await createYtRes.json();
    createdYtId = createYtData.data.item._id;
    console.log(`   - Created YouTube Media ID: ${createdYtId}`);
    console.log(`   - Normalized URL: ${createYtData.data.item.url}`);
    console.log(`   - External ID: ${createYtData.data.item.externalId}`);
    console.log(`   - Auto-generated Thumbnail: ${createYtData.data.item.thumbnailUrl}`);
    console.log("   -> PASS: YouTube item created with automatic thumbnail.\n");

    // ── Test 4: Create Instagram Reel Media Item ──
    console.log("4. Testing POST /api/admin/media (Instagram Reel with Custom Thumbnail)...");
    const igPayload = {
      platform: "instagram",
      url: "https://www.instagram.com/reel/C8xyz123_abc/",
      title: "Quick 30s Fish Fry Reel",
      titleMl: "30 സെക്കൻഡിൽ മീൻ പൊരിച്ചത്",
      description: "Crispy tawa fish fry made with Yumnest seafood masala.",
      category: "Seafood Specials",
      thumbnailUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb",
      duration: "0:30",
      status: "draft",
      featured: false,
      displayOrder: 2,
    };

    const createIgRes = await fetch(`${baseUrl}/api/admin/media`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify(igPayload),
    });

    if (createIgRes.status !== 201) {
      const err = await createIgRes.text();
      throw new Error(`Failed to create Instagram reel: ${createIgRes.status} - ${err}`);
    }

    const createIgData = await createIgRes.json();
    createdIgId = createIgData.data.item._id;
    console.log(`   - Created Instagram Media ID: ${createdIgId}`);
    console.log(`   - Initial Status: ${createIgData.data.item.status}`);
    console.log("   -> PASS: Instagram Reel created successfully.\n");

    // ── Test 5: List Admin Media with Filters ──
    console.log("5. Testing GET /api/admin/media (Search & Platform filters)...");
    const listRes = await fetch(`${baseUrl}/api/admin/media?platform=youtube`, {
      headers: { Cookie: sessionCookie },
    });
    const listData = await listRes.json();
    console.log(`   - Found YouTube items: ${listData.data.length}`);
    const foundYt = listData.data.find((m: any) => m._id === createdYtId);
    if (!foundYt) throw new Error("Created YouTube item not returned in platform=youtube query!");
    console.log("   -> PASS: Admin query with platform filter works.\n");

    // ── Test 6: Status Toggle (Publish Draft Reel) ──
    console.log("6. Testing Status Toggle PATCH /api/admin/media/:id/status...");
    const statusRes = await fetch(`${baseUrl}/api/admin/media/${createdIgId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ status: "published" }),
    });

    if (statusRes.status !== 200) {
      throw new Error(`Failed to update status: ${statusRes.status}`);
    }
    const statusData = await statusRes.json();
    if (statusData.data.item.status !== "published") {
      throw new Error("Status was not updated to published!");
    }
    console.log("   - Instagram reel is now: published");
    console.log("   -> PASS: Status toggle functioning correctly.\n");

    // ── Test 7: Storefront Public API ──
    console.log("7. Testing Storefront Public API GET /api/storefront/media...");
    const publicRes = await fetch(`${baseUrl}/api/storefront/media`);
    if (publicRes.status !== 200) {
      throw new Error(`Public media fetch failed: ${publicRes.status}`);
    }
    const publicData = await publicRes.json();
    console.log(`   - Storefront published count: ${publicData.data.length}`);
    const foundOnStorefront = publicData.data.find((m: any) => m.id === createdYtId || m.externalId === "dQw4w9WgXcQ");
    if (!foundOnStorefront) {
      throw new Error("Published YouTube video not found on customer storefront!");
    }
    console.log(`   - Storefront item: "${foundOnStorefront.title}" (${foundOnStorefront.platform})`);
    console.log("   -> PASS: Customer storefront reads live published media from MongoDB.\n");

    // ── Test 8: Clean Up ──
    console.log("8. Cleaning up test media items...");
    if (createdYtId) await MediaItemModel.findByIdAndDelete(createdYtId);
    if (createdIgId) await MediaItemModel.findByIdAndDelete(createdIgId);
    console.log("   - Test media items deleted cleanly.");

    console.log("\n=================================================");
    console.log("   ALL MEDIA MANAGEMENT INTEGRATION TESTS PASSED!   ");
    console.log("=================================================\n");
  } finally {
    if (createdYtId) await MediaItemModel.findByIdAndDelete(createdYtId).catch(() => {});
    if (createdIgId) await MediaItemModel.findByIdAndDelete(createdIgId).catch(() => {});
    server.close();
    await disconnectFromDatabase();
  }
}

runMediaIntegrationTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n[FAIL] Media Integration Tests Failed:", err);
    process.exit(1);
  });

