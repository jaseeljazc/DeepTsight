/**
 * Adds generated local values for PAYLOAD_SECRET and MFA_ENCRYPTION_KEY to .env.local when they
 * are absent. Never rewrites or prints existing content; prints key names only.
 *
 *   tsx scripts/cms/ensure-local-env.ts
 *
 * Development only. Production secrets are created by the owner in the hosting provider.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ENV_FILE = path.join(process.cwd(), ".env.local");

const generators: Record<string, () => string> = {
  PAYLOAD_SECRET: () => crypto.randomBytes(48).toString("base64url"),
  MFA_ENCRYPTION_KEY: () => crypto.randomBytes(32).toString("base64"),
};

const existing = fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, "utf8") : "";
const presentKeys = new Set(
  existing
    .split(/\r?\n/)
    .map((line) => /^\s*([A-Z0-9_]+)\s*=/.exec(line)?.[1])
    .filter((key): key is string => Boolean(key)),
);

const additions: string[] = [];
for (const [key, generate] of Object.entries(generators)) {
  if (!presentKeys.has(key)) additions.push(`${key}=${generate()}`);
}

if (additions.length === 0) {
  console.log("Nothing to add: PAYLOAD_SECRET and MFA_ENCRYPTION_KEY are already present.");
} else {
  const prefix = existing.length > 0 && !existing.endsWith("\n") ? "\n" : "";
  const block = `${prefix}# Generated locally by scripts/cms/ensure-local-env.ts (development only)\n${additions.join("\n")}\n`;
  fs.appendFileSync(ENV_FILE, block, { mode: 0o600 });
  console.log(`Added to .env.local: ${additions.map((line) => line.split("=")[0]).join(", ")}`);
}
