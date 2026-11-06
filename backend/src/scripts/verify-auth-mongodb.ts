/**
 * Comprehensive MongoDB Authentication Verification Suite
 * Verifies all security requirements:
 * 1. Missing credentials validation (HTTP 400)
 * 2. Unknown email rejection (HTTP 401)
 * 3. Inactive account rejection (HTTP 401)
 * 4. Incorrect password rejection (HTTP 401)
 * 5. Valid login against MongoDB (HTTP 200 + safe profile + HttpOnly cookie)
 * 6. Case-insensitive email login (e.g. UPPERCASE email matching)
 * 7. Protected session verification (GET /auth/me) with cookie (HTTP 200)
 * 8. Unauthenticated access blocked on GET /auth/me (HTTP 401)
 * 9. Logout (POST /auth/logout) (HTTP 200 + cleared cookie)
 * 10. Session invalidation in database after logout (HTTP 401)
 * 11. Protected catalogue admin route (GET /api/admin/categories) without vs with cookie
 */

import http from "node:http";
import { createApp } from "../app";
import { connectToDatabase, disconnectFromDatabase } from "../config/database";
import { loadEnvironment } from "../config/env";
import { AdminModel } from "../models/admin.model";
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
  await connectToDatabase(env.MONGODB_URI);

  const existingOwners = await AdminModel.find({ role: "owner" }).lean();
  console.log(`[Database] Found ${existingOwners.length} owner account(s) in collection 'admins':`);
  for (const owner of existingOwners) {
    console.log(`  - ID: ${owner._id} | Email: ${owner.email} | Name: ${owner.name} | Active: ${owner.active}`);
  }

  // Spin up test Express instance on free port
  const testPort = 4099;
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
    // ─── 1. Missing Credentials Validation (HTTP 400) ───────────────────
    {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (res.status === 400 && data.success === false) {
        record("Test 1: Missing Credentials", "PASS", "HTTP 400 returned for missing email/password");
      } else {
        record("Test 1: Missing Credentials", "FAIL", `Expected 400, got ${res.status}`);
      }
    }

    // ─── 2. Unknown Email (HTTP 401) ───────────────────────────────────
    {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "unknown.user.random@yumnest.test", password: "SomeRandomPassword123!" }),
      });
      const data = await res.json();
      const rawCookie = res.headers.get("set-cookie");

      if (res.status === 401 && data.error?.message === "Invalid email or password" && !rawCookie) {
        record("Test 2: Unknown Email", "PASS", "HTTP 401 returned with generic error; no session cookie set");
      } else {
        record("Test 2: Unknown Email", "FAIL", `Expected 401, got ${res.status}`);
      }
    }

    // ─── 3. Inactive Account (HTTP 401) ────────────────────────────────
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
        record("Test 3: Inactive Account", "PASS", "HTTP 401 returned for inactive account; access blocked");
      } else {
        record("Test 3: Inactive Account", "FAIL", `Expected 401, got ${res.status}`);
      }
    }

    // ─── Create Temporary Admin for Password & Session Tests ───────────
    const tempAdmin = await AdminModel.create({
      name: "Temporary QA Admin",
      email: tempTestEmail,
      passwordHash: await hashPassword(tempTestPassword),
      role: "owner",
      active: true,
    });
    tempAdminId = tempAdmin._id.toString();

    // ─── 4. Incorrect Password (HTTP 401) ──────────────────────────────
    {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: tempTestEmail, password: "IncorrectPassword999!" }),
      });
      const data = await res.json();
      const rawCookie = res.headers.get("set-cookie");

      if (res.status === 401 && data.error?.message === "Invalid email or password" && !rawCookie) {
        record("Test 4: Incorrect Password", "PASS", "Argon2id rejected incorrect password with HTTP 401; no cookie set");
      } else {
        record("Test 4: Incorrect Password", "FAIL", `Expected 401, got ${res.status}`);
      }
    }

    // ─── 5. Valid Login & Cookie Verification (HTTP 200) ───────────────
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
          "Test 5: Valid Login",
          "PASS",
          `Authenticated via Argon2id. Returned safe profile (ID: ${data.data.admin.id}); Set-Cookie contains HttpOnly, Path=/, SameSite=lax`
        );
      } else {
        record("Test 5: Valid Login", "FAIL", `Status ${res.status}, Cookie: ${rawCookie}`);
      }
    }

    // ─── 6. Case-Insensitive Email Login (HTTP 200) ────────────────────
    {
      const upperEmail = tempTestEmail.toUpperCase();
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: upperEmail, password: tempTestPassword }),
      });
      const data = await res.json();

      if (res.status === 200 && data.success === true && data.data?.admin?.email === tempTestEmail) {
        record("Test 6: Case-Insensitive Email", "PASS", "Login succeeded with uppercase email input");
      } else {
        record("Test 6: Case-Insensitive Email", "FAIL", `Status ${res.status}`);
      }
    }

    // ─── 7. Valid Session Verification (GET /auth/me) ──────────────────
    {
      const res = await fetch(`${baseUrl}/auth/me`, {
        headers: { Cookie: sessionCookie },
      });
      const data = await res.json();

      if (res.status === 200 && data.success === true && data.data?.admin?.email === tempTestEmail) {
        record("Test 7: Session Verification", "PASS", `GET /auth/me successfully validated session token against MongoDB 'adminsessions'`);
      } else {
        record("Test 7: Session Verification", "FAIL", `Status ${res.status}`);
      }
    }

    // ─── 8. Unauthenticated GET /auth/me Blocked (HTTP 401) ────────────
    {
      const res = await fetch(`${baseUrl}/auth/me`);
      const data = await res.json();

      if (res.status === 401 && data.success === false) {
        record("Test 8: Unauthenticated /auth/me Blocked", "PASS", "GET /auth/me without cookie properly rejected with HTTP 401");
      } else {
        record("Test 8: Unauthenticated /auth/me Blocked", "FAIL", `Expected 401, got ${res.status}`);
      }
    }

    // ─── 9. Protected Catalogue Route Check ────────────────────────────
    {
      const unauthRes = await fetch(`${baseUrl}/api/admin/categories`);
      const authRes = await fetch(`${baseUrl}/api/admin/categories`, {
        headers: { Cookie: sessionCookie },
      });

      if (unauthRes.status === 401 && authRes.status === 200) {
        record(
          "Test 9: Protected Admin Route Access",
          "PASS",
          "GET /api/admin/categories rejected unauthenticated (401) and allowed authenticated session (200)"
        );
      } else {
        record(
          "Test 9: Protected Admin Route Access",
          "FAIL",
          `Unauth: ${unauthRes.status}, Auth: ${authRes.status}`
        );
      }
    }

    // ─── 10. Logout (POST /auth/logout) ────────────────────────────────
    {
      const res = await fetch(`${baseUrl}/auth/logout`, {
        method: "POST",
        headers: { Cookie: sessionCookie },
      });
      const data = await res.json();
      const rawCookie = res.headers.get("set-cookie") || "";
      const isCleared = /Expires=Thu, 01 Jan 1970/i.test(rawCookie) || /Max-Age=0/i.test(rawCookie);

      if (res.status === 200 && data.data?.loggedOut === true && isCleared) {
        record("Test 10: Logout Endpoint", "PASS", "POST /auth/logout returned 200 and cleared HTTP-only session cookie");
      } else {
        record("Test 10: Logout Endpoint", "FAIL", `Status: ${res.status}, Cookie: ${rawCookie}`);
      }
    }

    // ─── 11. Session Invalidation in MongoDB ───────────────────────────
    {
      const res = await fetch(`${baseUrl}/auth/me`, {
        headers: { Cookie: sessionCookie },
      });

      if (res.status === 401) {
        record(
          "Test 11: Session Invalidation",
          "PASS",
          "Re-using prior session token returns HTTP 401 (session revoked from MongoDB collection)"
        );
      } else {
        record("Test 11: Session Invalidation", "FAIL", `Expected 401, got ${res.status}`);
      }
    }
  } finally {
    if (tempAdminId) {
      await AdminModel.findByIdAndDelete(tempAdminId);
    }
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await disconnectFromDatabase();
  }

  console.log("\n=======================================================");
  const allPassed = results.every((r) => r.status === "PASS");
  console.log(`SUMMARY: ${results.filter((r) => r.status === "PASS").length} / ${results.length} PASSED`);
  console.log("=======================================================\n");

  if (!allPassed) {
    process.exit(1);
  }
}

void runVerification().catch((err) => {
  console.error("Verification suite crashed:", err);
  process.exit(1);
});
