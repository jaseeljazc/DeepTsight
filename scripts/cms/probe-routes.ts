/**
 * Prints status and headers for a few routes against the production build. Diagnostic only.
 *   tsx scripts/cms/probe-routes.ts /path [/path...]
 */
import { startServer } from "./lib/server";

async function main(): Promise<void> {
  const routes = process.argv.slice(2);
  const server = await startServer(3100);
  try {
    for (const route of routes) {
      const response = await fetch(`${server.url}${route}`, { redirect: "manual" });
      console.log(`\n${route} → ${response.status}`);
      for (const [key, value] of response.headers) {
        if (key === "set-cookie") console.log(`  ${key}: [redacted]`);
        else console.log(`  ${key}: ${value.slice(0, 160)}`);
      }
      const body = await response.text();
      console.log(`  body: ${body.slice(0, 200).replace(/\s+/g, " ")}`);
    }
  } finally {
    server.stop();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
