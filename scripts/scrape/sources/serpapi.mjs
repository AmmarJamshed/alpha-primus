import {
  STATES,
  STATE_NAMES,
  dedupeKey,
  formatPhone,
  formatZip,
  nowIso,
  picsum,
  providerKey,
  slugify,
  sleep,
  titleCase,
} from "../lib/utils.mjs";
import { googleMapsPlaceUrl, resolveWebsite } from "../lib/validate-url.mjs";

/**
 * One SerpAPI Google Maps search per category per state.
 * Therapists are covered by the NPI Registry — not duplicated here.
 */
export const CATEGORY_SEARCHES = [
  { q: "mental health clinic", category: "Mental Health Clinics", subcategory: "Outpatient Care" },
  { q: "life coach", category: "Life Coaches", subcategory: "Personal Coaching" },
  { q: "executive coach", category: "Executive Coaches", subcategory: "Leadership Coaching" },
  { q: "career coach", category: "Career Coaches", subcategory: "Career Development" },
  { q: "relationship coach", category: "Relationship Coaches", subcategory: "Couples & Relationships" },
  { q: "support group", category: "Support Groups", subcategory: "Community Support" },
  { q: "discussion circle", category: "Discussion Circles", subcategory: "Peer Discussion" },
  { q: "men's support group", category: "Men's Groups", subcategory: "Brotherhood Circles" },
  { q: "women's support group", category: "Women's Groups", subcategory: "Empowerment Circles" },
  { q: "burnout recovery program", category: "Burnout Recovery Programs", subcategory: "Stress Recovery" },
  { q: "leadership development program", category: "Leadership Programs", subcategory: "Leadership Training" },
  { q: "mindfulness meditation center", category: "Mindfulness Programs", subcategory: "MBSR & Meditation" },
  { q: "wellness center", category: "Wellness Centers", subcategory: "Holistic Wellness" },
  { q: "personal development workshop", category: "Personal Development Programs", subcategory: "Self-Improvement" },
  { q: "wellness workshop community event", category: "Community Events", subcategory: "Local Gatherings" },
  // Retreat categories (Wellness/Leadership/Growth Retreats) sync via data/retreats.json on alternate bi-weekly run.
];

function getApiKey() {
  const key = process.env.SERPAPI_KEY;
  if (!key) {
    throw new Error("SERPAPI_KEY environment variable is required for search-based provider sync.");
  }
  return key;
}

function parseAddress(address, stateHint) {
  if (!address) return { street: "", city: "", state: stateHint, zipcode: "" };

  const parts = address.split(",").map((p) => p.trim());
  if (parts.length >= 3) {
    const last = parts[parts.length - 1];
    const stateZip = last.match(/^([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
    const city = parts[parts.length - 2];
    const street = parts.slice(0, -2).join(", ");
    return {
      street: titleCase(street),
      city: titleCase(city),
      state: stateZip?.[1] ?? stateHint,
      zipcode: formatZip(stateZip?.[2] ?? ""),
    };
  }

  return { street: titleCase(address), city: "", state: stateHint, zipcode: "" };
}

function hasVirtualServices(result) {
  for (const ext of result.extensions ?? []) {
    const services = ext.service_options ?? [];
    if (services.some((s) => /online|virtual|telehealth/i.test(s))) return true;
  }
  return result.types?.some((t) => /online/i.test(t)) ?? false;
}

async function resultToProvider(result, meta, stateHint, seenAt) {
  const name = result.title?.trim();
  if (!name) return null;

  const parsed = parseAddress(result.address, stateHint);
  const state = (parsed.state ?? stateHint).toUpperCase();
  if (!STATES.includes(state)) return null;

  const placeId = result.place_id;
  if (!placeId) return null;

  const slug = `${slugify(name)}-${placeId.slice(-8)}`.slice(0, 100);
  const city = parsed.city || titleCase(STATE_NAMES[state] ?? state);
  const lat = result.gps_coordinates?.latitude ?? 0;
  const lng = result.gps_coordinates?.longitude ?? 0;

  const website = await resolveWebsite(result.website ?? "");
  const mapsUrl = googleMapsPlaceUrl(placeId);

  const specialties = (result.types ?? [result.type]).filter(Boolean).slice(0, 6);

  return {
    id: `serp-${placeId}`,
    name: titleCase(name),
    slug,
    description: `${titleCase(name)} provides ${meta.category.toLowerCase()} in ${city}, ${state}. Listed via Google Maps. Contact directly to verify credentials and availability.`,
    category: meta.category,
    subcategory: meta.subcategory,
    website,
    phone: formatPhone(result.phone ?? ""),
    email: "",
    address: parsed.street,
    city,
    state,
    zipcode: parsed.zipcode,
    country: "United States",
    latitude: lat,
    longitude: lng,
    virtual_services: hasVirtualServices(result),
    social_links: {},
    images: picsum(slug),
    verified: false,
    claimed: false,
    featured: false,
    specialties,
    rating: result.rating ?? 0,
    review_count: result.reviews ?? 0,
    source: "serpapi_google_maps",
    source_id: placeId,
    source_url: mapsUrl,
    last_seen_at: seenAt,
    created_at: seenAt,
    updated_at: seenAt,
    _dedupe_key: dedupeKey(name, city, state),
  };
}

/** Single search: "{query} in {State Name}" */
async function searchMapsCategory(query, stateCode) {
  const apiKey = getApiKey();
  const stateName = STATE_NAMES[stateCode];
  const q = `${query} in ${stateName}`;

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_maps");
  url.searchParams.set("q", q);
  url.searchParams.set("type", "search");
  url.searchParams.set("api_key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SerpAPI ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error);

  return data.local_results ?? [];
}

export async function scrapeSerpApi() {
  const seenAt = nowIso();
  const providers = new Map();
  const dedupe = new Set();
  let apiCalls = 0;
  const byState = Object.fromEntries(STATES.map((s) => [s, 0]));

  for (const state of STATES) {
    for (const search of CATEGORY_SEARCHES) {
      try {
        apiCalls++;
        const results = await searchMapsCategory(search.q, state);

        for (const result of results) {
          const provider = await resultToProvider(result, search, state, seenAt);
          if (!provider) continue;
          if (dedupe.has(provider._dedupe_key)) continue;

          const key = providerKey("serpapi_google_maps", provider.source_id);
          if (providers.has(key)) continue;

          dedupe.add(provider._dedupe_key);
          providers.set(key, provider);
          byState[state]++;
        }

        console.log(
          `  SerpAPI ${state} / ${search.category}: ${results.length} results`,
        );
      } catch (err) {
        console.warn(`  SerpAPI warning ${state}/${search.category}: ${err.message}`);
      }

      await sleep(400);
    }
  }

  console.log(`  SerpAPI total: ${providers.size} providers, ${apiCalls} API calls`);
  console.log(`  SerpAPI by state:`, byState);

  return { providers: [...providers.values()], apiCalls };
}

export { CATEGORY_SEARCHES as SEARCHES };
