/**
 * The production fail-closed gate on /admin and /api (src/proxy.ts).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";
import { proxy } from "../../../src/proxy";

function statusFor(env: Record<string, string | undefined>): number {
  const saved = { ...process.env };
  Object.assign(process.env, env);
  for (const [key, value] of Object.entries(env)) if (value === undefined) delete process.env[key];
  try {
    return proxy(new NextRequest("http://localhost:3000/admin")).status;
  } finally {
    process.env = saved;
  }
}

test("production without CMS_ADMIN_ENABLED answers 404", () => {
  assert.equal(statusFor({ NEXT_PUBLIC_ENV: "production", CMS_ADMIN_ENABLED: undefined }), 404);
  assert.equal(statusFor({ NEXT_PUBLIC_ENV: "production", CMS_ADMIN_ENABLED: "yes" }), 404);
});

test("production with CMS_ADMIN_ENABLED=true passes through", () => {
  assert.equal(statusFor({ NEXT_PUBLIC_ENV: "production", CMS_ADMIN_ENABLED: "true" }), 200);
});

test("development passes through", () => {
  assert.equal(statusFor({ NEXT_PUBLIC_ENV: "development", CMS_ADMIN_ENABLED: undefined }), 200);
});
