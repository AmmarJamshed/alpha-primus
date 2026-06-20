import {
  CITIES_BY_STATE,
  STATES,
  dedupeKey,
  formatPhone,
  nowIso,
  picsum,
  providerKey,
  slugify,
  sleep,
  titleCase,
  USER_AGENT,
} from "../lib/utils.mjs";

const RADIUS_METERS = 20000;
const OVERPASS_SERVERS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

function categorizeFromTags(tags) {
  const name = (tags.name || "").toLowerCase();
  if (tags.office === "coach" || /life coach/i.test(name)) {
    return { category: "Life Coaches", subcategory: "Personal Coaching" };
  }
  if (/executive coach|leadership coach/i.test(name)) {
    return { category: "Executive Coaches", subcategory: "Leadership Coaching" };
  }
  if (/career coach/i.test(name)) {
    return { category: "Career Coaches", subcategory: "Career Development" };
  }
  if (tags.healthcare === "psychotherapist") {
    return { category: "Mental Health Clinics", subcategory: "Outpatient Mental Health" };
  }
  if (tags.healthcare === "counselling") {
    return { category: "Wellness Centers", subcategory: "Counselling Services" };
  }
  if (/mindfulness|meditation/i.test(name)) {
    return { category: "Mindfulness Programs", subcategory: "Meditation & Mindfulness" };
  }
  if (/support group|discussion circle/i.test(name)) {
    return { category: "Discussion Circles", subcategory: "Peer Discussion" };
  }
  if (tags.amenity === "community_centre") {
    return { category: "Support Groups", subcategory: "Community Support" };
  }
  return { category: "Wellness Centers", subcategory: "Community Wellness" };
}

async function overpassQuery(lat, lon) {
  const q = `[out:json][timeout:45];
(
  nwr["office"="coach"](around:${RADIUS_METERS},${lat},${lon});
  nwr["name"~"Coach|Mindfulness|Meditation|Support Group|Discussion Circle",i](around:${RADIUS_METERS},${lat},${lon});
  nwr["healthcare"~"counselling|psychotherapist"](around:${RADIUS_METERS},${lat},${lon});
  nwr["amenity"="community_centre"](around:${RADIUS_METERS},${lat},${lon});
);
out center tags;`;

  let lastError;
  for (const server of OVERPASS_SERVERS) {
    try {
      const res = await fetch(server, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": USER_AGENT,
        },
        body: "data=" + encodeURIComponent(q),
        signal: AbortSignal.timeout(35000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.elements ?? [];
    } catch (err) {
      lastError = err;
      await sleep(1000);
    }
  }
  throw lastError ?? new Error("Overpass failed");
}

function elementToProvider(element, state, cityFallback, seenAt) {
  const tags = element.tags ?? {};
  const name = tags.name || tags.operator;
  if (!name || name.length < 3) return null;

  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;
  if (!lat || !lon) return null;

  const meta = categorizeFromTags(tags);
  const city = titleCase(tags["addr:city"] || tags.city || cityFallback);
  const addrState = (tags["addr:state"] || state).toUpperCase();
  if (!STATES.includes(addrState)) return null;

  const osmId = `${element.type}/${element.id}`;
  const displayName = titleCase(name);
  const slug = `${slugify(displayName)}-osm-${element.id}`.slice(0, 100);

  let website = tags.website || tags["contact:website"] || "";
  if (website && !website.startsWith("http")) website = `https://${website}`;
  try {
    if (website) new URL(website);
    else website = "";
  } catch {
    website = "";
  }

  return {
    id: `osm-${element.id}`,
    name: displayName,
    slug,
    description: `${displayName} offers ${meta.category.toLowerCase()} in ${city}, ${addrState}. Sourced from OpenStreetMap. Contact directly to verify services.`,
    category: meta.category,
    subcategory: meta.subcategory,
    website,
    phone: formatPhone(tags.phone || tags["contact:phone"] || ""),
    email: (tags.email || tags["contact:email"] || "").toLowerCase(),
    address: titleCase(
      [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ") ||
        tags["addr:full"] ||
        "",
    ),
    city,
    state: addrState,
    zipcode: (tags["addr:postcode"] || "").slice(0, 5),
    country: "United States",
    latitude: lat,
    longitude: lon,
    virtual_services: false,
    social_links: {},
    images: picsum(slug),
    verified: false,
    claimed: false,
    featured: false,
    specialties: [meta.subcategory],
    rating: 0,
    review_count: 0,
    source: "openstreetmap",
    source_id: osmId,
    source_url: `https://www.openstreetmap.org/${element.type}/${element.id}`,
    last_seen_at: seenAt,
    created_at: seenAt,
    updated_at: seenAt,
    _dedupe_key: dedupeKey(displayName, city, addrState),
  };
}

export async function scrapeOsm({ perState = 25, maxCities = 1 } = {}) {
  const seenAt = nowIso();
  const providers = new Map();
  const dedupe = new Set();

  for (const state of STATES) {
    let stateCount = 0;
    const cities = (CITIES_BY_STATE[state] ?? []).slice(0, maxCities);

    for (const city of cities) {
      if (stateCount >= perState) break;

      try {
        const elements = await overpassQuery(city.lat, city.lon);

        for (const element of elements) {
          const provider = elementToProvider(element, state, city.name, seenAt);
          if (!provider) continue;
          if (dedupe.has(provider._dedupe_key)) continue;

          const key = providerKey("openstreetmap", provider.source_id);
          if (providers.has(key)) continue;

          dedupe.add(provider._dedupe_key);
          providers.set(key, provider);
          stateCount++;
          if (stateCount >= perState) break;
        }
      } catch (err) {
        console.warn(`  OSM warning ${state}/${city.name}: ${err.message}`);
      }

      await sleep(1500);
    }

    console.log(`  OSM ${state}: ${stateCount} providers`);
    await sleep(10000);
  }

  return [...providers.values()];
}
