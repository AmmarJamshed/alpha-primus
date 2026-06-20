#!/usr/bin/env npx tsx
import providers from "../../data/providers.json";
import { writeFileSync } from "fs";

interface ValidationResult {
  id: string;
  name: string;
  website: string;
  status: "ok" | "dead" | "skipped";
}

async function checkUrl(url: string): Promise<boolean> {
  if (!url) return false;
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  const results: ValidationResult[] = [];

  for (const p of providers.slice(0, 10)) {
    if (!p.website) {
      results.push({ id: p.id, name: p.name, website: "", status: "skipped" });
      continue;
    }
    const ok = await checkUrl(p.website);
    results.push({
      id: p.id,
      name: p.name,
      website: p.website,
      status: ok ? "ok" : "dead",
    });
  }

  writeFileSync(
    "scripts/discovery/output/report.json",
    JSON.stringify({ generated_at: new Date().toISOString(), results }, null, 2),
  );

  const dead = results.filter((r) => r.status === "dead").length;
  console.log(`Validated ${results.length} providers. Dead links: ${dead}`);
}

main();
