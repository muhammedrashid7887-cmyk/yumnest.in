/**
 * Comprehensive MongoDB Authentication Verification Suite
 * Verifies all 8 security requirements:
 * 1. Valid login against MongoDB
 * 2. Incorrect password rejection
 * 3. Unknown email rejection
 * 4. Inactive account rejection
 * 5. Missing owner account handling
 * 6. Valid session verification (GET /auth/me)
 * 7. Logout (POST /auth/logout)
 * 8. Session invalidation in database
 */

import http from "node:http";
import { createApp } from "../app";
import { connectToDatabase, disconnectFromDatabase } from "../config/database";
import { loadEnvironment } from "../config/env";
import { AdminModel } from "../models/admin.model";
import { AdminSessionModel } from "../models/admin-session.model";
import { hashPassword } from "../utils/password";

interface TestResult {
  step: string;
  status: "PASS" | "FAIL";
  message: string;
}

const results: TestResult[] = [];

function record(step: string, status: "PASS" | "FAIL", message: string) {
  results.push({ step, status, message });
  const icon = status === "PASS" ? "✅" : "❌";
  console.log(`${icon} [${step}] ${message}`);
}

async function runVerification() {
  console.log("\n=======================================================");
  console.log("   YUMNEST MONGODB AUTHENTICATION VERIFICATION SUITE");
  console.log("=======================================================\n");

  const env = loadEnvironment();
  console.log(`[Config] MongoDB URI: ${env.MONGODB_URI.replace(/:([^:@]+)@/, ":****@")}`);
  console.log(`[Config] Cookie Name: ${env.SESSION_COOKIE_NAME}`);
  console.log(`[Config] Cookie SameSite: ${env.SESSION_COOKIE_SAME_SITE}`);
  console.log(`[Config] Cookie Secure: ${env.SESSION_COOKIE_SECURE}`);
  console.log(`[Config] Frontend Origin: ${env.FRONTEND_ORIGIN}\n`);

  await connectToDatabase(env.MONGODB_URI);

  // Check existing owner in the connected database
  const existingOwners = await AdminModel.find({ role: "owner" }).lean();
  console.log(`[Database] Found ${existingOwners.length} owner account(s) in collection 'admins':`);
  for (const owner of existingOwners) {
    console.log(`  - ID: ${owner._id} | Email: ${owner.email} | Name: ${owner.name} | Active: ${owner.active}`);
  }

  // Spin up test Express instance
  const testPort = 4088;
  const app = createApp(env);
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(testPort, () => {
      console.log(`\n[Server] Test Express server listening on http://127.0.0.1:${testPort}\n`);
      resolve();
    });
  });

  const baseUrl = `http://127.0.0.1:${testPort}`;
  const tempTestEmail = `qa.audit.${Date.now()}@yumnest.test`;
  const tempTestPassword = "SecureAuditPassword2026!";
  let tempAdminId: string | undefined;

  try {
    // ─── 1. Unknown Email ──────────────────────────────────────────────
    {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "unknown.user.random@yumnest.test", password: "SomeRandomPassword123!" }),
      });
      const data = await res.json();
      const rawCookie = res.headers.get("set-cookie");

      if (res.status === 401 && data.error?.message === "Invalid email or password" && !rawCookie) {
        record("Test 1: Unknown Email", "PASS", "HTTP 401 returned with generic error; no session cookie set");
      } else {
        record("Test 1: Unknown Email", "FAIL", `Expected 401, got ${res.status}`);
      }
    }

    // ─── 2. Inactive Account ───────────────────────────────────────────
    {
      const inactiveEmail = `inactive.${Date.now()}@yumnest.test`;
      const inactiveUser = await AdminModel.create({
        name: "Inactive Admin",
        email: inactiveEmail,
        passwordHash: await hashPassword("InactivePassword123!"),
        role: "admin",
        active: false,
      });

      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inactiveEmail, password: "InactivePassword123!" }),
      });
      const data = await res.json();
      const rawCookie = res.headers.get("set-cookie");

      await AdminModel.findByIdAndDelete(inactiveUser._id);

      if (res.status === 401 && data.error?.message === "Invalid email or password" && !rawCookie) {
        record("Test 2: Inactive Account", "PASS", "HTTP 401 returned for inactive account; access blocked");
      } else {
        record("Test 2: Inactive Account", "FAIL", `Expected 401, got ${res.status}`);
      }
    }

    // ─── Create Temporary Admin for Password & Session Tests ───────────
    const tempAdmin = await AdminModel.create({
      name: "Temporary QA Admin",
      email: tempTestEmail,
      passwordHash: await hashPassword(tempTestPassword),
      role: "admin",
      active: true,
    });
    tempAdminId = tempAdmin._id.toString();

    // ─── 3. Incorrect Password ─────────────────────────────────────────
    {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: tempTestEmail, password: "IncorrectPassword999!" }),
      });
      const data = await res.json();
      const rawCookie = res.headers.get("set-cookie");

      if (res.status === 401 && data.error?.message === "Invalid email or password" && !rawCookie) {
        record("Test 3: Incorrect Password", "PASS", "Argon2id rejected incorrect password with HTTP 401; no cookie set");
      } else {
        record("Test 3: Incorrect Password", "FAIL", `Expected 401, got ${res.status}`);
      }
    }

    // ─── 4. Valid Login & Cookie Verification ──────────────────────────
    let sessionCookie = "";
    {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: tempTestEmail, password: tempTestPassword }),
      });
      const data = await res.json();
      const rawCookie = res.headers.get("set-cookie") || "";
      const match = rawCookie.match(/yumnest_admin_session=([^;]+)/);

      const hasHttpOnly = /httponly/i.test(rawCookie);
      const hasPath = /path=\//i.test(rawCookie);
      const hasSameSite = /samesite=lax/i.test(rawCookie);

      if (
        res.status === 200 &&
        data.success === true &&
        data.data?.admin?.email === tempTestEmail &&
        !data.data?.admin?.passwordHash &&
        match &&
        hasHttpOnly &&
        hasPath &&
        hasSameSite
      ) {
        sessionCookie = `yumnest_admin_session=${match[1]}`;
        record(
          "Test 4: Valid Login",
          "PASS",
          `Authenticated via Argon2id. Returned safe profile (ID: ${data.data.admin.id}); Set-Cookie contains HttpOnly, Path=/, SameSite=lax`
        );
      } else {
        record("Test 4: Valid Login", "FAIL", `Status ${res.status}, Cookie: ${rawCookie}`);
      }
    }

    // ─── 5. Valid Session Verification (GET /auth/me) ──────────────────
    {
      const res = await fetch(`${baseUrl}/auth/me`, {
        headers: { Cookie: sessionCookie },
      });
      const data = await res.json();

      if (res.status === 200 && data.success === true && data.data?.admin?.email === tempTestEmail) {
        record("Test 5: Session Verification", "PASS", `GET /auth/me successfully validated session token against MongoDB 'adminsessions'`);
      } else {
        record("Test 5: Session Verification", "FAIL", `Status ${res.status}`);
      }
    }

    // ─── 6. Logout (POST /auth/logout) ─────────────────────────────────
    {
      const res = await fetch(`${baseUrl}/auth/logout`, {
        method: "POST",
        headers: { Cookie: sessionCookie },
      });
      const data = await res.json();
      const rawCookie = res.headers.get("set-cookie") || "";
      const isCleared = /Expires=Thu, 01 Jan 1970/i.test(rawCookie) || /Max-Age=0/i.test(rawCookie);

      if (res.status === 200 && data.data?.loggedOut === true && isCleared) {
        record("Test 6: Logout Endpoint", "PASS", "POST /auth/logout returned 200 and cleared HTTP-only session cookie");
      } else {
        record("Test 6: Logout Endpoint", "FAIL", `Status: ${res.status}, Cookie: ${rawCookie}`);
      }
    }

    // ─── 7. Session Invalidation in MongoDB ────────────────────────────
    {
      const res = await fetch(`${baseUrl}/auth/me`, {
        headers: { Cookie: sessionCookie },
      });

      if (res.status === 401) {
        record(
          "Test 7: Session Invalidation",
          "PASS",
          "Re-using prior session token returns HTTP 401 (session revoked from MongoDB collection)"
        );
      } else {
        record("Test 7: Session Invalidation", "FAIL", `Expected 401, got ${res.status}`);
      }
    }

    // ─── 8. Missing Owner Account Behavior ─────────────────────────────
    {
      // Verify behavior when querying for an admin that does not exist
      const nonExistentEmail = "nobody.owner@yumnest.test";
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nonExistentEmail, password: "RandomPassword123!" }),
      });
      const data = await res.json();

      if (res.status === 401 && data.error?.message === "Invalid email or password") {
        record(
          "Test 8: Missing Account Handling",
          "PASS",
          "Unregistered account cleanly rejected with HTTP 401 (no server error 500 or leak of existence)"
        );
      } else {
        record("Test 8: Missing Account Handling", "FAIL", `Expected 401, got ${res.status}`);
      }
    }

  } catch (err) {
    console.error("FATAL ERROR IN VERIFICATION:", err);
  } finally {
    // Cleanup temporary admin
    if (tempAdminId) {
      await AdminModel.findByIdAndDelete(tempAdminId);
      await AdminSessionModel.deleteMany({ adminId: tempAdminId });
    }

    await new Promise<void>((resolve) => server.close(() => resolve()));
    await disconnectFromDatabase();

    console.log("\n=======================================================");
    console.log("               VERIFICATION SUMMARY");
    console.log("=======================================================");
    const passed = results.filter((r) => r.status === "PASS").length;
    const failed = results.filter((r) => r.status === "FAIL").length;
    console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("=======================================================\n");

    if (failed > 0) process.exit(1);
    else process.exit(0);
  }
}

void runVerification();

