/**
 * check-placeholders.ts
 * Scans source and content files for unverified placeholder markers.
 * Fails the build if NEXT_PUBLIC_ENV=production and placeholders are present.
 */

import fs from "node:fs";
import path from "node:path";

const targetDirs = [path.resolve("src")];
const placeholderPatterns = ["[PLACEHOLDER]", "TODO(CLIENT)", "TBD — CLIENT"];

interface Finding {
  file: string;
  line: number;
  pattern: string;
  preview: string;
}

const findings: Finding[] = [];

function scanDirectory(dir: string) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next") {
        scanDirectory(fullPath);
      }
    } else if (/\.(ts|tsx|mdx|json)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        for (const pattern of placeholderPatterns) {
          if (line.includes(pattern)) {
            findings.push({
              file: path.relative(process.cwd(), fullPath),
              line: index + 1,
              pattern,
              preview: line.trim(),
            });
          }
        }
      });
    }
  }
}

for (const dir of targetDirs) {
  scanDirectory(dir);
}

const isProduction = process.env["NEXT_PUBLIC_ENV"]?.trim() === "production";

console.log(`Scanned source files for placeholders. Total found: ${findings.length}`);

if (findings.length > 0) {
  console.log("\nDetected placeholder items:");
  findings.forEach((f) => {
    console.log(` - ${f.file}:${f.line} [${f.pattern}]: ${f.preview}`);
  });

  if (isProduction) {
    console.error(
      "\nCRITICAL: Production build cannot proceed with unverified placeholders present! (CR-02)",
    );
    process.exit(1);
  } else {
    console.log("\nNotice: Placeholders are permitted in development and preview environments.");
  }
} else {
  console.log("No placeholder markers found.");
}
