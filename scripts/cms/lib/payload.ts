import type { Payload } from "payload";
import { connectionString, type DbEnvName } from "./db";

/**
 * Starts Payload's Local API against one of the CMS databases. DATABASE_URI is pointed at the
 * chosen database before the config is imported, because the config reads it at import time.
 * Telemetry is off in the config; nothing here talks to the network except the database.
 */
export async function payloadFor(
  db: DbEnvName,
  { connect = true }: { connect?: boolean } = {},
): Promise<Payload> {
  process.env["DATABASE_URI"] = connectionString(db);
  process.env["DISABLE_PAYLOAD_HMR"] = "true";
  const { getPayload } = await import("payload");
  const { default: config } = await import("../../../src/payload.config");
  return getPayload({ config, disableDBConnect: !connect, disableOnInit: true });
}
