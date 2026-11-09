import http from "node:http";
import { createApp } from "../app";
import { connectToDatabase, disconnectFromDatabase } from "../config/database";
import { loadEnvironment } from "../config/env";
import { bootstrapAdminAccount } from "../services/auth.service";
import { AdminModel } from "../models/admin.model";

async function main() {
  console.log("==============================================================");
  console.log("   YUMNEST COMPLETE E2E AUTHENTICATION & ROUTE GUARD TEST    ");
  console.log("==============================================================\n");

  const env = loadEnvironment();
  await connectToDatabase(env.MONGODB_URI);

  // 1. Initial admin check / bootstrap
  console.log("[Step 1] Ensuring initial owner account exists via bootstrapAdminAccount...");
  await bootstrapAdminAccount(env);
  const owner = await AdminModel.findOne({ role: "owner" }).lean();
  if (!owner) {
    throw new Error("No owner account found after bootstrap!");
  }
  console.log(`[Step 1 PASS] Owner account verified: ${owner.email} (ID: ${owner._id})\n`);

  // Start test server
  const testPort = 4056;
  let app = createApp(env);
  let server = http.createServer(app);
  await new Promise<void>((res) => server.listen(testPort, res));
  const baseUrl = `http://127.0.0.1:${testPort}`;
  console.log(`[Server] Live test server listening on ${baseUrl}`);

  const adminEmail = env.ADMIN_EMAIL || "admin@yumnest.in";
  const adminPassword = env.ADMIN_PASSWORD || "admin";

  try {
    // 2. Login with correct email and password
    console.log("\n[Step 2] Testing login with CORRECT credentials...");
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    });
    const loginData = await loginRes.json();
    const setCookie = loginRes.headers.get("set-cookie") || "";
    const cookieMatch = setCookie.match(/yumnest_admin_session=([^;]+)/);

    if (
      loginRes.status !== 200 ||
      !loginData.success ||
      !cookieMatch ||
      !/httponly/i.test(setCookie) ||
      !/samesite=lax/i.test(setCookie) ||
      loginData.data.admin.email !== adminEmail
    ) {
      throw new Error(`Step 2 Failed: Status ${loginRes.status}, data: ${JSON.stringify(loginData)}`);
    }
    const sessionCookie = `yumnest_admin_session=${cookieMatch[1]}`;
    console.log(`[Step 2 PASS] Login successful! Session cookie: HttpOnly, SameSite=lax, Path=/`);
    console.log(`              Safe admin payload: ${loginData.data.admin.name} (${loginData.data.admin.email}), Role: ${loginData.data.admin.role}`);

    // 3. Login with incorrect password
    console.log("\n[Step 3] Testing login with INCORRECT password...");
    const badPwRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password: "TotallyWrongPassword999!" }),
    });
    const badPwData = await badPwRes.json();
    if (badPwRes.status !== 401 || badPwData.success !== false) {
      throw new Error(`Step 3 Failed: Expected 401, got ${badPwRes.status}`);
    }
    console.log(`[Step 3 PASS] Correctly rejected with HTTP 401: "${badPwData.error?.message}"`);

    // 4. Login with unknown email
    console.log("\n[Step 4] Testing login with UNKNOWN email...");
    const badEmailRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "unknown.random@yumnest.in", password: adminPassword }),
    });
    const badEmailData = await badEmailRes.json();
    if (badEmailRes.status !== 401 || badEmailData.success !== false) {
      throw new Error(`Step 4 Failed: Expected 401, got ${badEmailRes.status}`);
    }
    console.log(`[Step 4 PASS] Correctly rejected with HTTP 401: "${badEmailData.error?.message}"`);

    // 5. Refresh / verify active session (GET /auth/me)
    console.log("\n[Step 5] Testing session persistence (GET /auth/me)...");
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Cookie: sessionCookie },
    });
    const meData = await meRes.json();
    if (meRes.status !== 200 || meData.data?.admin?.email !== adminEmail) {
      throw new Error(`Step 5 Failed: Status ${meRes.status}`);
    }
    console.log(`[Step 5 PASS] Authenticated session persists on refresh for admin ${meData.data.admin.email}`);

    // 6. Protected routes without vs with login
    console.log("\n[Step 6] Testing protection of admin endpoints without credentials...");
    const unauthMe = await fetch(`${baseUrl}/auth/me`);
    const unauthProducts = await fetch(`${baseUrl}/api/admin/products`);
    const unauthCategories = await fetch(`${baseUrl}/api/admin/categories`);

    if (unauthMe.status !== 401 || unauthProducts.status !== 401 || unauthCategories.status !== 401) {
      throw new Error(`Step 6 Failed: Unauthenticated endpoints did not return 401`);
    }
    console.log(`[Step 6a PASS] All admin endpoints cleanly reject unauthenticated requests with HTTP 401`);

    const authProducts = await fetch(`${baseUrl}/api/admin/products`, { headers: { Cookie: sessionCookie } });
    const authCategories = await fetch(`${baseUrl}/api/admin/categories`, { headers: { Cookie: sessionCookie } });
    if (authProducts.status !== 200 || authCategories.status !== 200) {
      throw new Error(`Step 6b Failed: Authenticated access rejected (Products: ${authProducts.status}, Categories: ${authCategories.status})`);
    }
    console.log(`[Step 6b PASS] Authenticated admin session successfully accesses protected routes (HTTP 200)`);

    // 7. Logout and verify session invalidation
    console.log("\n[Step 7] Testing logout and session revocation...");
    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: "POST",
      headers: { Cookie: sessionCookie },
    });
    const logoutData = await logoutRes.json();
    const logoutCookie = logoutRes.headers.get("set-cookie") || "";
    if (logoutRes.status !== 200 || !logoutData.data?.loggedOut || !/Expires=Thu, 01 Jan 1970|Max-Age=0/i.test(logoutCookie)) {
      throw new Error(`Step 7 Failed: Logout endpoint did not clear cookie properly`);
    }

    const postLogoutMe = await fetch(`${baseUrl}/auth/me`, { headers: { Cookie: sessionCookie } });
    if (postLogoutMe.status !== 401) {
      throw new Error(`Step 7 Failed: Re-using revoked token returned ${postLogoutMe.status} instead of 401`);
    }
    console.log(`[Step 7 PASS] Logout cleared session cookie and invalidated session in database (HTTP 401 on re-use)`);

    // 8. Verify login works after restarting the backend
    console.log("\n[Step 8] Testing server restart & re-authentication...");
    server.closeAllConnections?.();
    await new Promise<void>((res) => server.close(() => res()));
    await new Promise((res) => setTimeout(res, 300));
    console.log("              Old server instance stopped.");

    const restartPort = 4057;
    const restartBaseUrl = `http://127.0.0.1:${restartPort}`;
    const restartApp = createApp(env);
    const restartServer = http.createServer(restartApp);
    await new Promise<void>((res) => restartServer.listen(restartPort, res));
    console.log(`              New server instance started on ${restartBaseUrl}.`);

    try {
      const restartLoginRes = await fetch(`${restartBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const restartLoginData = await restartLoginRes.json();
      if (restartLoginRes.status !== 200 || !restartLoginData.success) {
        throw new Error(`Step 8 Failed: Login after restart failed with status ${restartLoginRes.status}`);
      }
      console.log(`[Step 8 PASS] Successfully logged in after backend restart (HTTP 200)`);
    } finally {
      restartServer.closeAllConnections?.();
      await new Promise<void>((res) => restartServer.close(() => res()));
    }

    console.log("\n==============================================================");
    console.log("   🎉 ALL 8 E2E AUTHENTICATION REQUIREMENTS VERIFIED & PASSED!  ");
    console.log("==============================================================\n");
  } finally {
    server.closeAllConnections?.();
    await new Promise<void>((res) => server.close(() => res()));
    await disconnectFromDatabase();
  }
}

main().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
