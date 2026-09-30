import fs from "node:fs";
import path from "node:path";

const fontsDir = path.resolve("public/fonts");
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

const targets = [
  {
    family: "Archivo",
    weight: "500",
    filename: "archivo-500.woff2",
    query: "family=Archivo:wght@500",
  },
  {
    family: "Archivo",
    weight: "600",
    filename: "archivo-600.woff2",
    query: "family=Archivo:wght@600",
  },
  {
    family: "IBM Plex Sans",
    weight: "400",
    filename: "ibm-plex-sans-400.woff2",
    query: "family=IBM+Plex+Sans:wght@400",
  },
  {
    family: "IBM Plex Sans",
    weight: "500",
    filename: "ibm-plex-sans-500.woff2",
    query: "family=IBM+Plex+Sans:wght@500",
  },
  {
    family: "IBM Plex Sans",
    weight: "600",
    filename: "ibm-plex-sans-600.woff2",
    query: "family=IBM+Plex+Sans:wght@600",
  },
  {
    family: "IBM Plex Mono",
    weight: "400",
    filename: "ibm-plex-mono-400.woff2",
    query: "family=IBM+Plex+Mono:wght@400",
  },
  {
    family: "IBM Plex Mono",
    weight: "500",
    filename: "ibm-plex-mono-500.woff2",
    query: "family=IBM+Plex+Mono:wght@500",
  },
];

const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

for (const target of targets) {
  const url = `https://fonts.googleapis.com/css2?${target.query}&display=swap`;
  const res = await fetch(url, { headers: { "User-Agent": userAgent } });
  const css = await res.text();

  // Find the block for latin subset
  const latinBlockMatch = css.match(
    /\/\*\s*latin\s*\*\/[\s\S]*?src:\s*url\((https:\/\/[^)]+\.woff2)\)/i,
  );

  const fontUrl = latinBlockMatch ? latinBlockMatch[1] : null;
  if (!fontUrl) {
    throw new Error(`Could not find latin woff2 URL for ${target.family} ${target.weight}`);
  }

  console.log(`Downloading ${target.filename} from ${fontUrl}...`);
  const fontRes = await fetch(fontUrl);
  const buffer = Buffer.from(await fontRes.arrayBuffer());
  fs.writeFileSync(path.join(fontsDir, target.filename), buffer);
  console.log(`Saved ${target.filename} (${buffer.length} bytes)`);
}

console.log("All 5 fonts downloaded successfully.");
