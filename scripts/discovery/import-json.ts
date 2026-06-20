#!/usr/bin/env npx tsx
/**
 * JSON Import script for Alpha Primus provider discovery pipeline.
 * Usage: npx tsx scripts/discovery/import-json.ts path/to/file.json
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error("Usage: npx tsx scripts/discovery/import-json.ts <json-file>");
  process.exit(1);
}

const records = JSON.parse(readFileSync(resolve(jsonPath), "utf-8"));
const seen = new Set<string>();

const deduped = (Array.isArray(records) ? records : [records]).filter(
  (r: { name: string; city: string; state: string }) => {
    const key = `${r.name}-${r.city}-${r.state}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  },
);

const output = deduped.map((r: Record<string, unknown>) => ({
  ...r,
  _import_status: "pending_approval",
  _imported_at: new Date().toISOString(),
}));

const outPath = resolve("scripts/discovery/output/import-queue.json");
writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`Queued ${output.length} records for admin approval → ${outPath}`);
