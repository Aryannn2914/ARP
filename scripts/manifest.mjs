import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.join(__dirname, "..", "public", "data");

function buildManifest(dir) {
  const files = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(
      (d) =>
        d.isFile() && d.name.endsWith(".json") && d.name !== "manifest.json"
    )
    .map((d) => d.name)
    .sort();

  if (files.length === 0) return;

  const out = { chapters: files };
  fs.writeFileSync(
    path.join(dir, "manifest.json"),
    JSON.stringify(out, null, 2)
  );
  console.log(
    "✓ manifest:",
    path.relative(ROOT, dir),
    `(${files.length} files)`
  );
}

function walk() {
  if (!fs.existsSync(ROOT)) {
    console.error("data root not found:", ROOT);
    process.exit(1);
  }

  for (const stdEnt of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (!stdEnt.isDirectory()) continue;
    const stdDir = path.join(ROOT, stdEnt.name);

    for (const subjEnt of fs.readdirSync(stdDir, { withFileTypes: true })) {
      if (!subjEnt.isDirectory()) continue;
      const subjDir = path.join(stdDir, subjEnt.name);
      buildManifest(subjDir);
    }
  }
}

walk();
