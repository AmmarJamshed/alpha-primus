import {
  dedupeKey,
  nowIso,
  slugify,
  titleCase,
} from "../lib/utils.mjs";
import {
  parseAddress,
  normalizeWebsite,
  resultImages,
  searchAllStates,
} from "../lib/serpapi-shared.mjs";

export const RETREAT_SEARCHES = [
  { q: "wellness retreat", category: "Wellness Retreats", label: "Wellness Retreats" },
  { q: "yoga retreat center", category: "Wellness Retreats", label: "Yoga Retreats" },
  { q: "leadership retreat", category: "Leadership Retreats", label: "Leadership Retreats" },
  { q: "spiritual retreat center", category: "Growth Retreats", label: "Growth Retreats" },
  { q: "meditation retreat", category: "Wellness Retreats", label: "Meditation Retreats" },
];

function resultToRetreat(result, meta, stateHint, seenAt) {
  const title = result.title?.trim();
  if (!title) return null;

  const parsed = parseAddress(result.address, stateHint);
  const state = (parsed.state ?? stateHint).toUpperCase();
  if (!["CA", "TX", "FL", "NY", "IL"].includes(state)) return null;

  const placeId = result.place_id;
  if (!placeId) return null;

  const slug = `${slugify(title)}-${placeId.slice(-8)}`.slice(0, 100);
  const city = parsed.city || titleCase(stateHint);
  const website = normalizeWebsite(result.website);
  const types = (result.types ?? [result.type]).filter(Boolean).join(", ");
  const location = parsed.street
    ? `${parsed.street}, ${city}, ${state}`
    : result.address ?? `${city}, ${state}`;

  return {
    id: `retreat-${placeId}`,
    title: titleCase(title),
    slug,
    description: `${titleCase(title)} is a ${meta.category.toLowerCase()} venue in ${city}, ${state}. ${types ? `Services include ${types.toLowerCase()}. ` : ""}Contact directly for dates, pricing, and availability. Listed via Google Maps.`,
    location,
    city,
    state,
    date: "Contact for schedule",
    duration: "Varies by program",
    price: undefined,
    organizer: titleCase(title),
    website,
    booking_link: website || `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    images: resultImages(result, slug),
    category: meta.category,
    featured: false,
    source: "serpapi_google_maps",
    source_id: placeId,
    source_url: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    phone: result.phone ?? "",
    rating: result.rating ?? 0,
    review_count: result.reviews ?? 0,
    last_seen_at: seenAt,
    created_at: seenAt,
    updated_at: seenAt,
    _dedupe_key: dedupeKey(title, city, state),
  };
}

export async function scrapeRetreats() {
  const seenAt = nowIso();
  const retreats = new Map();
  const dedupe = new Set();

  const apiCalls = await searchAllStates(RETREAT_SEARCHES, (result, search, state) => {
    const retreat = resultToRetreat(result, search, state, seenAt);
    if (!retreat) return;
    if (dedupe.has(retreat._dedupe_key)) return;

    dedupe.add(retreat._dedupe_key);
    retreats.set(retreat.source_id, retreat);
  });

  const list = [...retreats.values()];
  list.sort((a, b) => a.state.localeCompare(b.state) || a.title.localeCompare(b.title));
  list.forEach((r, i) => {
    r.featured = i % 6 === 0;
    delete r._dedupe_key;
  });

  console.log(`  Retreats total: ${list.length} (${apiCalls} API calls)`);
  return { retreats: list, apiCalls };
}
