#!/usr/bin/env node
/**
 * Regenerate packages/api-client/openapi.json from the FastAPI app.
 * Requires placeholder env vars — no live database needed for schema export.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const apiDir = path.join(repoRoot, "apps/api");
const outFile = path.join(repoRoot, "packages/api-client/openapi.json");

const env = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL ?? "postgresql+psycopg://x:x@localhost/x",
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY ?? "export-only",
};

const result = spawnSync(
  "python",
  ["-c", "import json; from app.main import app; print(json.dumps(app.openapi()))"],
  { cwd: apiDir, env, encoding: "utf8" },
);

if (result.status !== 0) {
  console.error(result.stderr);
  process.exit(result.status ?? 1);
}

fs.writeFileSync(outFile, result.stdout.trim());
console.log(`Wrote ${outFile}`);
