import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { googleMapsPlaceUrl, mapWithConcurrency, resolveWebsite } from "./scrape/lib/validate-url.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

async function sanitizeRetreats(items) {
  let cleared = 0;

  const updated = await mapWithConcurrency(items, 25, async (retreat) => {
    const mapsUrl = retreat.source_url || googleMapsPlaceUrl(retreat.source_id);
    const website = await resolveWebsite(retreat.website);

    if (retreat.website && !website) cleared++;

    return {
      ...retreat,
      website,
      booking_link: mapsUrl,
      source_url: mapsUrl,
    };
  });

  return { updated, cleared };
}

async function sanitizeEvents(items) {
  let cleared = 0;

  const updated = await mapWithConcurrency(items, 25, async (event) => {
    const mapsUrl = event.source_url || googleMapsPlaceUrl(event.source_id);
    const rawWebsite =
      event.website ??
      (event.registration_url?.includes("google.com/maps") ? "" : event.registration_url);
    const website = await resolveWebsite(rawWebsite);

    if (rawWebsite && !website) cleared++;

    return {
      ...event,
      website,
      registration_url: mapsUrl,
      source_url: mapsUrl,
    };
  });

  return { updated, cleared };
}

async function sanitizeProviders(items) {
  let cleared = 0;

  const updated = await mapWithConcurrency(items, 25, async (provider) => {
    if (!provider.website) return provider;

    const website = await resolveWebsite(provider.website);
    if (provider.website && !website) cleared++;

    const mapsUrl =
      provider.source === "serpapi_google_maps"
        ? googleMapsPlaceUrl(provider.source_id)
        : provider.source_url;

    return {
      ...provider,
      website,
      source_url: mapsUrl || provider.source_url,
    };
  });

  return { updated, cleared };
}

async function main() {
  console.log("Sanitizing listing URLs (DNS check + Google Maps fallback)...\n");

  const retreatsPath = join(ROOT, "data", "retreats.json");
  const eventsPath = join(ROOT, "data", "events.json");
  const providersPath = join(ROOT, "data", "providers.json");

  const retreats = JSON.parse(readFileSync(retreatsPath, "utf-8"));
  const events = JSON.parse(readFileSync(eventsPath, "utf-8"));
  const providers = JSON.parse(readFileSync(providersPath, "utf-8"));

  const r = await sanitizeRetreats(retreats);
  const e = await sanitizeEvents(events);
  const p = await sanitizeProviders(providers);

  writeFileSync(retreatsPath, JSON.stringify(r.updated, null, 2));
  writeFileSync(eventsPath, JSON.stringify(e.updated, null, 2));
  writeFileSync(providersPath, JSON.stringify(p.updated, null, 2));

  console.log(`Retreats:  cleared ${r.cleared} dead website(s), all booking links → Google Maps`);
  console.log(`Events:    cleared ${e.cleared} dead website(s), all registration links → Google Maps`);
  console.log(`Providers: cleared ${p.cleared} dead website(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
