import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import path from "node:path";

/**
 * Starts the production server (`next start`) as a single node process and stops it again.
 * Used by the parity snapshot and the test runner so no server is ever left behind.
 */
export interface RunningServer {
  url: string;
  stop: () => void;
}

/** Variables that would reach real external services. Always blanked for local runs. */
export const OFFLINE_ENV: Record<string, string> = {
  RESEND_API_KEY: "",
  UPSTASH_REDIS_REST_URL: "",
  UPSTASH_REDIS_REST_TOKEN: "",
};

function killTree(child: ChildProcess): void {
  if (child.pid === undefined || child.exitCode !== null) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    child.kill("SIGTERM");
  }
}

async function waitForUrl(url: string, timeoutMs: number, child: ChildProcess): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (child.exitCode !== null)
      throw new Error(`Server exited early with code ${child.exitCode}.`);
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status > 0) return;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Server at ${url} did not answer within ${timeoutMs} ms.`);
}

export async function startServer(
  port: number,
  env: Record<string, string> = {},
): Promise<RunningServer> {
  const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
  const child = spawn(process.execPath, [nextBin, "start", "-p", String(port)], {
    env: { ...process.env, ...OFFLINE_ENV, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  child.stdout?.on("data", (chunk: Buffer) => {
    log += chunk.toString();
  });
  child.stderr?.on("data", (chunk: Buffer) => {
    log += chunk.toString();
  });
  const stop = () => killTree(child);
  process.on("exit", stop);
  const url = `http://localhost:${port}`;
  try {
    await waitForUrl(url, 60_000, child);
  } catch (error) {
    stop();
    console.error(log.slice(-2000));
    throw error;
  }
  return { url, stop };
}
