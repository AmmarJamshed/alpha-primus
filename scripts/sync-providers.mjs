import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { isStale, nowIso, providerKey, STALE_DAYS } from "./scrape/lib/utils.mjs";
import {
  SYNC_MODES,
  SERPAPI_MONTHLY_LIMIT,
  SERPAPI_MAX_CALLS_PER_RUN,
  assertWithinBudget,
  assertActualWithinBudget,
} from "./scrape/lib/serpapi-budget.mjs";
import { scrapeNpi } from "./scrape/sources/npi.mjs";
import { scrapeSerpApi } from "./scrape/sources/serpapi.mjs";
import { scrapeRetreats } from "./scrape/sources/serpapi-retreats.mjs";
import { scrapeEvents } from "./scrape/sources/serpapi-events.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PROVIDERS_PATH = join(ROOT, "data", "providers.json");
const RETREATS_PATH = join(ROOT, "data", "retreats.json");
const EVENTS_PATH = join(ROOT, "data", "events.json");
const REPORT_PATH = join(ROOT, "scripts", "discovery", "output", "sync-report.json");

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  }),
);

const SYNC_MODE = args["sync-mode"] ?? "providers";
const NPI_PER_STATE = parseInt(args["npi-per-state"] ?? "100", 10);
const MAX_SERPAPI_CALLS = parseInt(
  args["max-serpapi-calls"] ?? String(SERPAPI_MAX_CALLS_PER_RUN),
  10,
);

if (!SYNC_MODES[SYNC_MODE]) {
  console.error(`Invalid --sync-mode="${SYNC_MODE}". Use: ${Object.keys(SYNC_MODES).join(", ")}`);
  process.exit(1);
}

const modeConfig = SYNC_MODES[SYNC_MODE];
const SKIP_NPI = args["skip-npi"] === "true" || modeConfig.skip.npi;
const SKIP_SEARCH = args["skip-search"] === "true" || modeConfig.skip.search;
const SKIP_RETREATS = args["skip-retreats"] === "true" || modeConfig.skip.retreats;
const SKIP_EVENTS = args["skip-events"] === "true" || modeConfig.skip.events;

function normalizeKey(p) {
  const source = p.source ?? "cms_npi_registry";
  const sourceId =
    p.source_id ??
    p.npi_number ??
    (p.id?.startsWith("npi-") ? p.id.replace("npi-", "") : p.id);
  return providerKey(source, sourceId);
}

function loadJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return [];
  }
}

function listingKey(item) {
  return `${item.source ?? "unknown"}:${item.source_id ?? item.id}`;
}

function mergeListings(existing, scraped) {
  const seenAt = nowIso();
  const existingByKey = new Map(existing.map((item) => [listingKey(item), item]));
  const scrapedKeys = new Set();
  const merged = [];

  for (const incoming of scraped) {
    const key = listingKey(incoming);
    scrapedKeys.add(key);
    const prev = existingByKey.get(key);

    merged.push({
      ...incoming,
      created_at: prev?.created_at ?? incoming.created_at,
      updated_at: seenAt,
      last_seen_at: seenAt,
      featured: prev?.featured ?? incoming.featured,
    });
  }

  for (const prev of existing) {
    const key = listingKey(prev);
    if (scrapedKeys.has(key)) continue;
    if (!isStale(prev.last_seen_at, STALE_DAYS)) {
      merged.push({ ...prev, updated_at: seenAt });
    }
  }

  merged.sort((a, b) =>
    a.state.localeCompare(b.state) || a.city.localeCompare(b.city) || a.title.localeCompare(b.title),
  );

  merged.forEach((item, i) => {
    item.featured = i % 6 === 0;
  });

  return merged;
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
    sync_mode: SYNC_MODE,
    stale_threshold_days: STALE_DAYS,
    serpapi_monthly_limit: SERPAPI_MONTHLY_LIMIT,
    serpapi_max_calls_per_run: MAX_SERPAPI_CALLS,
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
  const estimatedCalls = assertWithinBudget(SYNC_MODE, MAX_SERPAPI_CALLS);

  console.log("Alpha Primus listing sync starting...");
  console.log(`Mode: ${SYNC_MODE} (${modeConfig.label})`);
  console.log(
    `SerpAPI budget: ${estimatedCalls} estimated / ${MAX_SERPAPI_CALLS} max per run (${SERPAPI_MONTHLY_LIMIT}/month)\n`,
  );

  let serpapiCalls = 0;
  const existing = loadJson(PROVIDERS_PATH);
  const existingKeys = new Set(existing.map(normalizeKey));

  let npi = [];
  if (!SKIP_NPI) {
    console.log("Source 1: CMS NPI Registry (licensed therapists & counselors)");
    npi = await scrapeNpi({ perState: NPI_PER_STATE });
  }

  let search = [];
  if (!SKIP_SEARCH) {
    console.log("\nSource 2: SerpAPI Google Maps (one search per category per state)");
    const result = await scrapeSerpApi();
    search = result.providers;
    serpapiCalls += result.apiCalls;
  }

  let merged = existing;
  let removed = [];
  if (!SKIP_NPI || !SKIP_SEARCH) {
    const scraped = [...npi, ...search];
    merged = mergeProviders(existing, scraped);

    const mergedKeys = new Set(merged.map(normalizeKey));
    removed = existing.filter((p) => {
      const key = normalizeKey(p);
      return existingKeys.has(key) && !mergedKeys.has(key) && !p.claimed;
    });
  }

  const existingRetreats = loadJson(RETREATS_PATH);
  let mergedRetreats = existingRetreats;
  let scrapedRetreats = [];

  if (!SKIP_RETREATS) {
    console.log("\nSource 3: SerpAPI Google Maps (real retreat venues)");
    const result = await scrapeRetreats();
    scrapedRetreats = result.retreats;
    serpapiCalls += result.apiCalls;
    mergedRetreats = mergeListings(existingRetreats, scrapedRetreats);
  }

  const existingEvents = loadJson(EVENTS_PATH);
  let mergedEvents = existingEvents;
  let scrapedEvents = [];

  if (!SKIP_EVENTS) {
    console.log("\nSource 4: SerpAPI Google Maps (real workshops & events)");
    const result = await scrapeEvents();
    scrapedEvents = result.events;
    serpapiCalls += result.apiCalls;
    mergedEvents = mergeListings(existingEvents, scrapedEvents);
  }

  assertActualWithinBudget(serpapiCalls, MAX_SERPAPI_CALLS);

  mkdirSync(dirname(PROVIDERS_PATH), { recursive: true });
  mkdirSync(dirname(REPORT_PATH), { recursive: true });

  if (!SKIP_NPI || !SKIP_SEARCH) {
    writeFileSync(PROVIDERS_PATH, JSON.stringify(merged, null, 2));
  }

  if (!SKIP_RETREATS) {
    writeFileSync(RETREATS_PATH, JSON.stringify(mergedRetreats, null, 2));
  }

  if (!SKIP_EVENTS) {
    writeFileSync(EVENTS_PATH, JSON.stringify(mergedEvents, null, 2));
  }

  const report = buildReport(
    SKIP_NPI && SKIP_SEARCH ? loadJson(PROVIDERS_PATH) : existing,
    SKIP_NPI && SKIP_SEARCH ? loadJson(PROVIDERS_PATH) : merged,
    [...npi, ...search],
    SKIP_NPI && SKIP_SEARCH ? [] : removed,
    {
      npi_count: npi.length,
      search_count: search.length,
      serpapi_calls_used: serpapiCalls,
      serpapi_calls_estimated: estimatedCalls,
      retreats_before: existingRetreats.length,
      retreats_after: mergedRetreats.length,
      retreats_scraped: scrapedRetreats.length,
      events_before: existingEvents.length,
      events_after: mergedEvents.length,
      events_scraped: scrapedEvents.length,
    },
  );
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log("\n--- Sync complete ---");
  console.log(`SerpAPI calls used: ${serpapiCalls} / ${MAX_SERPAPI_CALLS} (${SERPAPI_MONTHLY_LIMIT}/month across 2 runs)`);
  if (!SKIP_NPI || !SKIP_SEARCH) {
    console.log(`Providers: ${existing.length} -> ${merged.length} (removed ${removed.length} stale)`);
  }
  if (!SKIP_RETREATS) {
    console.log(`Retreats:  ${existingRetreats.length} -> ${mergedRetreats.length}`);
  }
  if (!SKIP_EVENTS) {
    console.log(`Events:    ${existingEvents.length} -> ${mergedEvents.length}`);
  }
  console.log(`Report:    ${REPORT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
