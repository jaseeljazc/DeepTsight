/**
 * Compares two parity snapshots (see parity-snapshot.ts) field by field.
 *
 *   tsx scripts/cms/parity-compare.ts <dirA> <dirB>
 *
 * Exits non-zero unless every difference is covered by docs/cms/parity-allowlist.json. Each
 * allowlist entry names a route ("*" for all), a field and a written reason. With `normalise`
 * (a regular expression), matching text is masked in both snapshots before comparing, so only
 * that part of the field may differ; without it the whole field may differ.
 */
import fs from "node:fs";
import path from "node:path";

interface AllowEntry {
  route: string;
  field: string;
  reason: string;
  normalise?: string;
}

const ALLOWLIST_PATH = path.join("docs", "cms", "parity-allowlist.json");

function loadAllowlist(): AllowEntry[] {
  if (!fs.existsSync(ALLOWLIST_PATH)) return [];
  const entries = JSON.parse(fs.readFileSync(ALLOWLIST_PATH, "utf8")) as AllowEntry[];
  for (const entry of entries) {
    if (!entry.reason || entry.reason.trim().length < 10) {
      throw new Error(`Allowlist entry for ${entry.route} ${entry.field} has no written reason.`);
    }
  }
  return entries;
}

function readDir(dir: string): Map<string, Record<string, unknown>> {
  const files = new Map<string, Record<string, unknown>>();
  for (const name of fs.readdirSync(dir).filter((file) => file.endsWith(".json"))) {
    files.set(
      name,
      JSON.parse(fs.readFileSync(path.join(dir, name), "utf8")) as Record<string, unknown>,
    );
  }
  return files;
}

function mask(value: unknown, pattern: string): string {
  return JSON.stringify(value).replace(new RegExp(pattern, "g"), "[masked]");
}

function main(): void {
  const [dirA, dirB] = process.argv.slice(2);
  if (!dirA || !dirB) {
    console.error("Usage: tsx scripts/cms/parity-compare.ts <dirA> <dirB>");
    process.exit(2);
  }
  const allowlist = loadAllowlist();
  const a = readDir(dirA);
  const b = readDir(dirB);
  const unexplained: string[] = [];
  const allowed: string[] = [];

  for (const name of new Set([...a.keys(), ...b.keys()])) {
    const left = a.get(name);
    const right = b.get(name);
    if (!left || !right) {
      unexplained.push(`${name}: present only in ${left ? dirA : dirB}`);
      continue;
    }
    const route = String(left["route"]);
    const fields = new Set([...Object.keys(left), ...Object.keys(right)]);
    for (const field of fields) {
      if (field === "headers") {
        const lh = (left[field] ?? {}) as Record<string, unknown>;
        const rh = (right[field] ?? {}) as Record<string, unknown>;
        for (const header of new Set([...Object.keys(lh), ...Object.keys(rh)])) {
          if (lh[header] !== rh[header]) {
            // Security headers are never allowlisted: they must stay byte-identical.
            unexplained.push(
              `${route} headers.${header}: ${JSON.stringify(lh[header])} → ${JSON.stringify(rh[header])}`,
            );
          }
        }
        continue;
      }
      const lv = JSON.stringify(left[field]);
      const rv = JSON.stringify(right[field]);
      if (lv === rv) continue;
      const entries = allowlist.filter(
        (entry) => (entry.route === "*" || entry.route === route) && entry.field === field,
      );
      const covered = entries.some((entry) =>
        entry.normalise
          ? mask(left[field], entry.normalise) === mask(right[field], entry.normalise)
          : true,
      );
      const line = `${route} ${field}:\n    A: ${lv?.slice(0, 400)}\n    B: ${rv?.slice(0, 400)}`;
      (covered ? allowed : unexplained).push(line);
    }
  }

  if (allowed.length > 0) console.log(`${allowed.length} allowlisted difference(s).`);
  if (unexplained.length > 0) {
    console.log(`${unexplained.length} unexplained difference(s):`);
    for (const line of unexplained) console.log(`  ${line}`);
    process.exit(1);
  }
  console.log("Parity: 0 unexplained differences.");
}

main();
