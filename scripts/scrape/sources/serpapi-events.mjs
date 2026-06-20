import {
  dedupeKey,
  nowIso,
  slugify,
  titleCase,
} from "../lib/utils.mjs";
import {
  parseAddress,
  resultImages,
  searchAllStates,
} from "../lib/serpapi-shared.mjs";
import { googleMapsPlaceUrl, resolveWebsite } from "../lib/validate-url.mjs";

export const EVENT_SEARCHES = [
  { q: "wellness workshop", category: "Community Events", label: "Wellness Workshops" },
  { q: "support group meeting", category: "Support Groups", label: "Support Meetups" },
  { q: "meditation class", category: "Mindfulness Programs", label: "Meditation Classes" },
  { q: "personal growth workshop", category: "Personal Development Programs", label: "Growth Workshops" },
  { q: "mental health workshop", category: "Community Events", label: "Mental Health Workshops" },
];

async function resultToEvent(result, meta, stateHint, seenAt) {
  const title = result.title?.trim();
  if (!title) return null;

  const parsed = parseAddress(result.address, stateHint);
  const state = (parsed.state ?? stateHint).toUpperCase();
  if (!["CA", "TX", "FL", "NY", "IL"].includes(state)) return null;

  const placeId = result.place_id;
  if (!placeId) return null;

  const slug = `${slugify(title)}-${placeId.slice(-8)}`.slice(0, 100);
  const city = parsed.city || titleCase(stateHint);
  const website = await resolveWebsite(result.website);
  const mapsUrl = googleMapsPlaceUrl(placeId);
  const types = (result.types ?? [result.type]).filter(Boolean).join(", ");
  const location = parsed.street
    ? `${parsed.street}, ${city}, ${state}`
    : result.address ?? `${city}, ${state}`;

  return {
    id: `event-${placeId}`,
    title: titleCase(title),
    slug,
    description: `${titleCase(title)} hosts ${meta.category.toLowerCase()} programs in ${city}, ${state}. ${types ? `Offerings include ${types.toLowerCase()}. ` : ""}Visit their website or call for upcoming dates and registration.`,
    date: "See website for dates",
    time: "Varies",
    location,
    city,
    state,
    organizer: titleCase(title),
    website,
    registration_url: mapsUrl,
    images: resultImages(result, slug),
    category: meta.category,
    featured: false,
    source: "serpapi_google_maps",
    source_id: placeId,
    source_url: mapsUrl,
    phone: result.phone ?? "",
    rating: result.rating ?? 0,
    review_count: result.reviews ?? 0,
    last_seen_at: seenAt,
    created_at: seenAt,
    updated_at: seenAt,
    _dedupe_key: dedupeKey(title, city, state),
  };
}

export async function scrapeEvents() {
  const seenAt = nowIso();
  const events = new Map();
  const dedupe = new Set();

  const apiCalls = await searchAllStates(EVENT_SEARCHES, async (result, search, state) => {
    const event = await resultToEvent(result, search, state, seenAt);
    if (!event) return;
    if (dedupe.has(event._dedupe_key)) return;

    dedupe.add(event._dedupe_key);
    events.set(event.source_id, event);
  });

  const list = [...events.values()];
  list.sort((a, b) => a.state.localeCompare(b.state) || a.title.localeCompare(b.title));
  list.forEach((e, i) => {
    e.featured = i % 6 === 0;
    delete e._dedupe_key;
  });

  console.log(`  Events total: ${list.length} (${apiCalls} API calls)`);
  return { events: list, apiCalls };
}
