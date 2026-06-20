import {
  CITIES_BY_STATE,
  STATES,
  STATE_CENTROIDS,
  dedupeKey,
  formatPhone,
  formatZip,
  nowIso,
  picsum,
  providerKey,
  slugify,
  sleep,
  titleCase,
  USER_AGENT,
} from "../lib/utils.mjs";

const QUERIES = [
  { taxonomy: "Psychologist", category: "Therapists", subcategory: "Psychology" },
  { taxonomy: "Clinical Social Worker", category: "Therapists", subcategory: "Clinical Social Work" },
  { taxonomy: "Marriage & Family Therapist", category: "Therapists", subcategory: "Marriage & Family Therapy" },
  { taxonomy: "Mental Health Counselor", category: "Therapists", subcategory: "Mental Health Counseling" },
  { taxonomy: "Psychiatrist", category: "Therapists", subcategory: "Psychiatry" },
  { taxonomy: "Social Worker", category: "Therapists", subcategory: "Social Work" },
  { taxonomy: "Counselor", category: "Therapists", subcategory: "Counseling" },
];

async function fetchNpiPage(taxonomy, state, skip) {
  const url = new URL("https://npiregistry.cms.hhs.gov/api/");
  url.searchParams.set("version", "2.1");
  url.searchParams.set("taxonomy_description", taxonomy);
  url.searchParams.set("state", state);
  url.searchParams.set("limit", "200");
  url.searchParams.set("skip", String(skip));

  const res = await fetch(url.toString(), { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`NPI API ${res.status} for ${taxonomy} ${state}`);
  return res.json();
}

function getProviderName(basic, enumType) {
  if (enumType === "NPI-2" && basic.organization_name) {
    return titleCase(basic.organization_name.trim());
  }
  if (!basic.last_name) return null;
  const name = titleCase(`${basic.first_name ?? ""} ${basic.last_name ?? ""}`.trim());
  return basic.credential ? `${name}, ${basic.credential}` : name;
}

function getLocationAddress(addresses) {
  const loc = addresses?.find((a) => a.address_purpose === "LOCATION") ?? addresses?.[0];
  if (!loc) return null;
  return {
    address: titleCase(`${loc.address_1 ?? ""}${loc.address_2 ? ` ${loc.address_2}` : ""}`.trim()),
    city: titleCase(loc.city ?? ""),
    state: (loc.state ?? "").toUpperCase(),
    zipcode: formatZip(loc.postal_code),
    phone: formatPhone(loc.telephone_number),
  };
}

function extractEmail(endpoints) {
  for (const ep of endpoints ?? []) {
    const val = ep.endpoint ?? "";
    if (val.includes("@") && !val.includes(" ")) return val.toLowerCase();
  }
  return "";
}

function specialtiesFromTaxonomies(taxonomies) {
  const specs = new Set();
  for (const t of taxonomies ?? []) {
    if (t.desc) specs.add(t.desc.replace(/^Counselor,\s*/i, ""));
  }
  return [...specs].slice(0, 6);
}

function recordToProvider(record, meta, seenAt) {
  const name = getProviderName(record.basic, record.enumeration_type);
  if (!name) return null;
  if (record.basic?.status && record.basic.status !== "A") return null;

  const loc = getLocationAddress(record.addresses);
  if (!loc?.city || !loc?.state || !STATES.includes(loc.state)) return null;

  const taxonomy = record.taxonomies?.find((t) => t.primary) ?? record.taxonomies?.[0];
  const npi = record.number;
  const slug = `${slugify(name)}-${npi}`.slice(0, 100);
  const centroid = STATE_CENTROIDS[loc.state] ?? { lat: 39.8283, lng: -98.5795 };

  return {
    id: `npi-${npi}`,
    name,
    slug,
    description: `${name} is a licensed ${(taxonomy?.desc ?? meta.category).toLowerCase()} serving clients in ${loc.city}, ${loc.state}. Listed in the U.S. NPI Registry as an active healthcare provider.`,
    category: meta.category,
    subcategory: taxonomy?.desc?.split(", ").slice(1).join(", ") || meta.subcategory,
    website: "",
    phone: loc.phone,
    email: extractEmail(record.endpoints),
    address: loc.address,
    city: loc.city,
    state: loc.state,
    zipcode: loc.zipcode,
    country: "United States",
    latitude: centroid.lat,
    longitude: centroid.lng,
    virtual_services: false,
    social_links: {},
    images: picsum(slug),
    verified: true,
    claimed: false,
    featured: false,
    specialties: specialtiesFromTaxonomies(record.taxonomies),
    rating: 0,
    review_count: 0,
    npi_number: npi,
    source: "cms_npi_registry",
    source_id: npi,
    source_url: `https://npiregistry.cms.hhs.gov/provider-view/${npi}`,
    last_seen_at: seenAt,
    created_at: seenAt,
    updated_at: seenAt,
    _dedupe_key: dedupeKey(name, loc.city, loc.state),
  };
}

export async function scrapeNpi({ perState = 100 } = {}) {
  const seenAt = nowIso();
  const providers = new Map();

  for (const state of STATES) {
    let stateCount = 0;

    for (const q of QUERIES) {
      if (stateCount >= perState) break;

      let skip = 0;
      let hasMore = true;

      while (hasMore && stateCount < perState) {
        const data = await fetchNpiPage(q.taxonomy, state, skip);
        const results = data.results ?? [];
        if (results.length === 0) break;

        for (const record of results) {
          const key = providerKey("cms_npi_registry", record.number);
          if (providers.has(key)) continue;

          const provider = recordToProvider(record, q, seenAt);
          if (!provider || provider.state !== state) continue;

          providers.set(key, provider);
          stateCount++;
          if (stateCount >= perState) break;
        }

        skip += results.length;
        if (results.length < 200) hasMore = false;
        await sleep(300);
      }
    }

    console.log(`  NPI ${state}: ${stateCount} providers`);
  }

  return [...providers.values()];
}
