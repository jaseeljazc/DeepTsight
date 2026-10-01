import fs from "node:fs";
import { expect, test, type APIRequestContext } from "@playwright/test";
import { timeStep, totpCode } from "../../src/cms/mfa/totp";

export interface TestAccount {
  email: string;
  password: string;
  roles: string[];
  totpSecret: string;
  recoveryCodes: string[];
}

/** Skips the calling suite when there is no test database (blocker recorded in PROGRESS). */
export function requireTestDatabase(): void {
  test.skip(!process.env["DATABASE_URI_TEST"], "DATABASE_URI_TEST is not set");
}

export function readAccount(file: string): TestAccount {
  return JSON.parse(fs.readFileSync(file, "utf8")) as TestAccount;
}

const usedSteps = new Map<string, number>();

/** A TOTP code for a step not used before by this test run (the server refuses replays). */
export async function freshCode(secret: string): Promise<string> {
  let step = timeStep();
  while (step <= (usedSteps.get(secret) ?? -1)) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    step = timeStep();
  }
  usedSteps.set(secret, step);
  return totpCode(secret, step);
}

export async function passwordLogin(request: APIRequestContext, account: TestAccount) {
  return request.post("/api/users/login", {
    data: { email: account.email, password: account.password },
  });
}

/** Password plus TOTP: leaves the request context holding both cookies. */
export async function fullLogin(request: APIRequestContext, account: TestAccount): Promise<void> {
  const login = await passwordLogin(request, account);
  expect(login.status()).toBe(200);
  const verify = await request.post("/api/users/mfa/verify", {
    form: { code: await freshCode(account.totpSecret), next: "/admin" },
    maxRedirects: 0,
  });
  expect(verify.status()).toBe(303);
  expect(verify.headers()["set-cookie"] ?? "").toContain("dts-mfa=");
}
