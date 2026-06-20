import {
  CITIES_BY_STATE,
  STATES,
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

const SEARCHES = [
  { q: "life coach", category: "Life Coaches", subcategory: "Personal Coaching" },
  { q: "executive coach", category: "Executive Coaches", subcategory: "Leadership Coaching" },
  { q: "support group", category: "Support Groups", subcategory: "Community Support" },
  { q: "wellness center", category: "Wellness Centers", subcategory: "Holistic Wellness" },
  { q: "mental health clinic", category: "Mental Health Clinics", subcategory: "Outpatient Care" },
  { q: "career coach", category: "Career Coaches", subcategory: "Career Development" },
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

  // e.g. "8663 Chalmers Dr, Los Angeles, CA 90035"
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
  const extensions = result.extensions ?? [];
  for (const ext of extensions) {
    const services = ext.service_options ?? ext.service_options ?? [];
    if (services.some((s) => /online|virtual|telehealth/i.test(s))) return true;
  }
  if (result.types?.some((t) => /online/i.test(t))) return true;
  return false;
}

function resultToProvider(result, meta, stateHint, seenAt) {
  const name = result.title?.trim();
  if (!name) return null;

  const parsed = parseAddress(result.address, stateHint);
  const state = (parsed.state ?? stateHint).toUpperCase();
  if (!STATES.includes(state)) return null;

  const placeId = result.place_id;
  if (!placeId) return null;

  const slug = `${slugify(name)}-${placeId.slice(-8)}`.slice(0, 100);
  const city = parsed.city || titleCase(CITIES_BY_STATE[state]?.[0]?.name ?? "Unknown");
  const lat = result.gps_coordinates?.latitude ?? 0;
  const lng = result.gps_coordinates?.longitude ?? 0;

  let website = result.website ?? "";
  if (website && !website.startsWith("http")) website = `https://${website}`;
  try {
    if (website) new URL(website);
    else website = "";
  } catch {
    website = "";
  }

  const specialties = (result.types ?? [result.type]).filter(Boolean).slice(0, 6);

  return {
    id: `serp-${placeId}`,
    name: titleCase(name),
    slug,
    description: `${titleCase(name)} provides ${meta.category.toLowerCase()} in ${city}, ${state}. Listed via Google Maps search results. Contact directly to verify credentials and availability.`,
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
    source_url: result.reviews_link
      ? `https://www.google.com/maps/place/?q=place_id:${placeId}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${placeId}`,
    last_seen_at: seenAt,
    created_at: seenAt,
    updated_at: seenAt,
    _dedupe_key: dedupeKey(name, city, state),
  };
}

async function searchMaps(query, city, state) {
  const apiKey = getApiKey();
  const q = `${query} ${city} ${state}`;
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

export async function scrapeSerpApi({ perState = 30, maxCities = 1 } = {}) {
  const seenAt = nowIso();
  const providers = new Map();
  const dedupe = new Set();
  let apiCalls = 0;

  for (const state of STATES) {
    let stateCount = 0;
    const cities = (CITIES_BY_STATE[state] ?? []).slice(0, maxCities);

    for (const city of cities) {
      if (stateCount >= perState) break;

      for (const search of SEARCHES) {
        if (stateCount >= perState) break;

        try {
          apiCalls++;
          const results = await searchMaps(search.q, city.name, state);

          for (const result of results) {
            const provider = resultToProvider(result, search, state, seenAt);
            if (!provider) continue;
            if (dedupe.has(provider._dedupe_key)) continue;

            const key = providerKey("serpapi_google_maps", provider.source_id);
            if (providers.has(key)) continue;

            dedupe.add(provider._dedupe_key);
            providers.set(key, provider);
            stateCount++;
            if (stateCount >= perState) break;
          }
        } catch (err) {
          console.warn(`  SerpAPI warning ${state}/${city.name}/${search.q}: ${err.message}`);
        }

        await sleep(500);
      }
    }

    console.log(`  SerpAPI ${state}: ${stateCount} providers`);
  }

  console.log(`  SerpAPI total API calls: ${apiCalls}`);
  return [...providers.values()];
}
