import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { isStale, nowIso, providerKey, STALE_DAYS } from "./scrape/lib/utils.mjs";
import { scrapeNpi } from "./scrape/sources/npi.mjs";
import { scrapeSerpApi } from "./scrape/sources/serpapi.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PROVIDERS_PATH = join(ROOT, "data", "providers.json");
const REPORT_PATH = join(ROOT, "scripts", "discovery", "output", "sync-report.json");

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  }),
);

const NPI_PER_STATE = parseInt(args["npi-per-state"] ?? "100", 10);
const SKIP_NPI = args["skip-npi"] === "true";
const SKIP_SEARCH = args["skip-search"] === "true";

function normalizeKey(p) {
  const source = p.source ?? "cms_npi_registry";
  const sourceId =
    p.source_id ??
    p.npi_number ??
    (p.id?.startsWith("npi-") ? p.id.replace("npi-", "") : p.id);
  return providerKey(source, sourceId);
}

function loadExisting() {
  try {
    return JSON.parse(readFileSync(PROVIDERS_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function mergeProviders(existing, scraped) {
  const seenAt = nowIso();
  const existingByKey = new Map(existing.map((p) => [normalizeKey(p), p]));
  const scrapedKeys = new Set();

  const merged = [];

  for (const incoming of scraped) {
    const key = providerKey(incoming.source, incoming.source_id);
    scrapedKeys.add(key);
    const prev = existingByKey.get(key);

    const record = {
      ...incoming,
      created_at: prev?.created_at ?? incoming.created_at,
      updated_at: seenAt,
      last_seen_at: seenAt,
      claimed: prev?.claimed ?? false,
      featured: prev?.featured ?? incoming.featured,
      rating: incoming.rating || prev?.rating || 0,
      review_count: incoming.review_count || prev?.review_count || 0,
    };

    delete record._dedupe_key;
    merged.push(record);
  }

  for (const prev of existing) {
    const key = normalizeKey(prev);
    if (scrapedKeys.has(key)) continue;
    if (prev.claimed && !isStale(prev.last_seen_at, STALE_DAYS * 2)) {
      merged.push({ ...prev, updated_at: seenAt });
    }
  }

  merged.sort((a, b) =>
    a.state.localeCompare(b.state) || a.city.localeCompare(b.city) || a.name.localeCompare(b.name),
  );

  merged.forEach((p, i) => {
    if (!p.claimed) p.featured = i % 10 === 0;
  });

  return merged;
}

function buildReport(before, after, scraped, removed, meta = {}) {
  const bySource = {};
  for (const p of after) {
    bySource[p.source] = (bySource[p.source] ?? 0) + 1;
  }

  return {
    synced_at: nowIso(),
    stale_threshold_days: STALE_DAYS,
    before_count: before.length,
    after_count: after.length,
    scraped_count: scraped.length,
    removed_count: removed.length,
    removed_ids: removed.map((p) => p.id),
    by_source: bySource,
    by_state: Object.fromEntries(
      ["CA", "TX", "FL", "NY", "IL"].map((s) => [
        s,
        after.filter((p) => p.state === s).length,
      ]),
    ),
    ...meta,
  };
}

async function main() {
  console.log("Alpha Primus provider sync starting...\n");

  const existing = loadExisting();
  const existingKeys = new Set(existing.map(normalizeKey));

  console.log("Source 1: CMS NPI Registry (licensed therapists & counselors)");
  const npi = SKIP_NPI ? [] : await scrapeNpi({ perState: NPI_PER_STATE });

  console.log("\nSource 2: SerpAPI Google Maps (one search per category per state)");
  const search = SKIP_SEARCH ? [] : await scrapeSerpApi();

  const scraped = [...npi, ...search];
  const merged = mergeProviders(existing, scraped);

  const mergedKeys = new Set(merged.map(normalizeKey));
  const removed = existing.filter((p) => {
    const key = normalizeKey(p);
    return existingKeys.has(key) && !mergedKeys.has(key) && !p.claimed;
  });

  mkdirSync(dirname(PROVIDERS_PATH), { recursive: true });
  mkdirSync(dirname(REPORT_PATH), { recursive: true });

  writeFileSync(PROVIDERS_PATH, JSON.stringify(merged, null, 2));

  const report = buildReport(existing, merged, scraped, removed, {
    npi_count: npi.length,
    search_count: search.length,
  });
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log("\n--- Sync complete ---");
  console.log(`Existing:  ${existing.length}`);
  console.log(`Scraped:   ${scraped.length} (NPI: ${npi.length}, SerpAPI: ${search.length})`);
  console.log(`Final:     ${merged.length}`);
  console.log(`Removed:   ${removed.length} stale/expired listings`);
  console.log(`Report:    ${REPORT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
