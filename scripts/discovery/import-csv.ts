#!/usr/bin/env npx tsx
/**
 * CSV Import script for Alpha Primus provider discovery pipeline.
 * Usage: npx tsx scripts/discovery/import-csv.ts path/to/file.csv
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

interface ImportRecord {
  name: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city: string;
  state: string;
  zipcode?: string;
  category: string;
  description?: string;
}

function parseCsv(content: string): ImportRecord[] {
  const lines = content.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const record: Record<string, string> = {};
    headers.forEach((h, i) => {
      record[h] = values[i] ?? "";
    });
    return record as unknown as ImportRecord;
  });
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function dedupe(records: ImportRecord[]): ImportRecord[] {
  const seen = new Set<string>();
  return records.filter((r) => {
    const key = `${r.name.toLowerCase()}-${r.city.toLowerCase()}-${r.state.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function validateUrl(url?: string): boolean {
  if (!url) return true;
  try {
    new URL(url.startsWith("http") ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
}

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: npx tsx scripts/discovery/import-csv.ts <csv-file>");
  process.exit(1);
}

const content = readFileSync(resolve(csvPath), "utf-8");
const records = dedupe(parseCsv(content));
const valid = records.filter((r) => validateUrl(r.website));
const invalid = records.length - valid.length;

const output = valid.map((r, i) => ({
  id: `import-${Date.now()}-${i}`,
  name: r.name,
  slug: slugify(r.name),
  description: r.description ?? `${r.name} provides ${r.category} services in ${r.city}, ${r.state}.`,
  category: r.category,
  subcategory: "",
  website: r.website ?? "",
  phone: r.phone ?? "",
  email: r.email ?? "",
  address: r.address ?? "",
  city: r.city,
  state: r.state,
  zipcode: r.zipcode ?? "",
  country: "United States",
  latitude: 0,
  longitude: 0,
  virtual_services: false,
  social_links: {},
  images: [`https://picsum.photos/seed/${slugify(r.name)}/800/600`],
  verified: false,
  claimed: false,
  featured: false,
  specialties: [],
  rating: 0,
  review_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  _import_status: "pending_approval",
}));

const outPath = resolve("scripts/discovery/output/import-queue.json");
writeFileSync(outPath, JSON.stringify(output, null, 2));

console.log(`Imported ${output.length} records (${invalid} invalid URLs skipped)`);
console.log(`Output: ${outPath}`);
