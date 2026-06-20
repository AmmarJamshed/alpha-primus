#!/usr/bin/env node
/**
 * Fetches REAL licensed mental health providers from the CMS NPI Registry
 * (public U.S. government data — https://npiregistry.cms.hhs.gov/)
 *
 * Usage: node scripts/scrape-npi-providers.mjs [--target=500]
 */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "..", "data", "providers.json");

const STATES = ["CA", "TX", "FL", "NY", "IL"];
const TARGET = parseInt(process.argv.find((a) => a.startsWith("--target="))?.split("=")[1] ?? "500", 10);

const QUERIES = [
  { taxonomy: "Psychologist", category: "Therapists", subcategory: "Psychology" },
  { taxonomy: "Clinical Social Worker", category: "Therapists", subcategory: "Clinical Social Work" },
  { taxonomy: "Marriage & Family Therapist", category: "Therapists", subcategory: "Marriage & Family Therapy" },
  { taxonomy: "Mental Health Counselor", category: "Therapists", subcategory: "Mental Health Counseling" },
  { taxonomy: "Psychiatrist", category: "Therapists", subcategory: "Psychiatry" },
  { taxonomy: "Social Worker", category: "Therapists", subcategory: "Social Work" },
  { taxonomy: "Counselor", category: "Therapists", subcategory: "Counseling" },
  { taxonomy: "Behavior Analyst", category: "Personal Development Programs", subcategory: "Behavior Analysis" },
];

const STATE_CENTroids = {
  CA: { lat: 36.7783, lng: -119.4179 },
  TX: { lat: 31.9686, lng: -99.9018 },
  FL: { lat: 27.6648, lng: -81.5158 },
  NY: { lat: 43.2994, lng: -74.2179 },
  IL: { lat: 40.6331, lng: -89.3985 },
};

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function titleCase(str) {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\b(Mc|Mac)([a-z])/g, (_, p, c) => p + c.toUpperCase());
}

function formatPhone(raw) {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return raw;
}

function formatZip(postal) {
  if (!postal) return "";
  const z = postal.replace(/\D/g, "");
  return z.length >= 5 ? z.slice(0, 5) : postal;
}

function getProviderName(basic, enumType) {
  if (enumType === "NPI-2" && basic.organization_name) {
    return titleCase(basic.organization_name.trim());
  }
  const parts = [basic.first_name, basic.middle_name, basic.last_name, basic.credential]
    .filter(Boolean)
    .map((p) => String(p).trim());
  if (parts.length === 0) return null;
  const name = titleCase(`${basic.first_name ?? ""} ${basic.last_name ?? ""}`.trim());
  return basic.credential ? `${name}, ${basic.credential}` : name;
}

function getLocationAddress(addresses) {
  const loc =
    addresses?.find((a) => a.address_purpose === "LOCATION") ?? addresses?.[0];
  if (!loc) return null;
  return {
    address: titleCase(`${loc.address_1 ?? ""}${loc.address_2 ? ` ${loc.address_2}` : ""}`.trim()),
    city: titleCase(loc.city ?? ""),
    state: (loc.state ?? "").toUpperCase(),
    zipcode: formatZip(loc.postal_code),
    phone: formatPhone(loc.telephone_number),
    fax: loc.fax_number,
  };
}

function getPrimaryTaxonomy(taxonomies) {
  return taxonomies?.find((t) => t.primary) ?? taxonomies?.[0];
}

function extractEmail(endpoints) {
  if (!endpoints?.length) return "";
  for (const ep of endpoints) {
    const val = ep.endpoint ?? "";
    if (val.includes("@") && !val.includes(" ")) return val.toLowerCase();
  }
  return "";
}

function buildDescription(name, taxonomy, category, city, state) {
  const specialty = taxonomy?.desc ?? category;
  return `${name} is a licensed ${specialty.toLowerCase()} serving clients in ${city}, ${state}. Listed in the U.S. NPI Registry as an active healthcare provider. Contact directly to verify credentials, availability, and services offered.`;
}

function specialtiesFromTaxonomies(taxonomies) {
  const specs = new Set();
  for (const t of taxonomies ?? []) {
    if (t.desc) {
      const cleaned = t.desc.replace(/^Counselor,\s*/i, "").replace(/^Social Worker,\s*/i, "");
      specs.add(cleaned);
    }
  }
  return [...specs].slice(0, 6);
}

function picsum(seed) {
  return [
    `https://picsum.photos/seed/${seed}-1/800/600`,
    `https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop`,
    `https://picsum.photos/seed/${seed}-2/800/600`,
  ];
}

async function fetchNpiPage(taxonomy, state, skip) {
  const url = new URL("https://npiregistry.cms.hhs.gov/api/");
  url.searchParams.set("version", "2.1");
  url.searchParams.set("taxonomy_description", taxonomy);
  url.searchParams.set("state", state);
  url.searchParams.set("limit", "200");
  url.searchParams.set("skip", String(skip));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`NPI API ${res.status} for ${taxonomy} ${state}`);
  return res.json();
}

function recordToProvider(record, meta) {
  const { category, subcategory } = meta;
  const name = getProviderName(record.basic, record.enumeration_type);
  if (!name) return null;

  const loc = getLocationAddress(record.addresses);
  if (!loc || !loc.city || !loc.state) return null;
  if (!STATES.includes(loc.state)) return null;

  const taxonomy = getPrimaryTaxonomy(record.taxonomies);
  const slugBase = slugify(name);
  const npi = record.number;
  const slug = `${slugBase}-${npi}`.slice(0, 100);
  const email = extractEmail(record.endpoints);
  const centroid = STATE_CENTroids[loc.state] ?? { lat: 39.8283, lng: -98.5795 };

  return {
    id: `npi-${npi}`,
    name,
    slug,
    description: buildDescription(name, taxonomy, category, loc.city, loc.state),
    category,
    subcategory: taxonomy?.desc?.includes(",")
      ? taxonomy.desc.split(", ").slice(1).join(", ") || subcategory
      : subcategory,
    website: "",
    phone: loc.phone,
    email,
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
    enumeration_type: record.enumeration_type,
    source: "cms_npi_registry",
    source_url: `https://npiregistry.cms.hhs.gov/provider-view/${npi}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function scrapeAll() {
  const perState = Math.ceil(TARGET / STATES.length);
  const seen = new Map();
  let apiCalls = 0;

  for (const state of STATES) {
    let stateCount = 0;

    for (const q of QUERIES) {
      if (stateCount >= perState) break;

      let skip = 0;
      let hasMore = true;

      while (hasMore && stateCount < perState) {
        apiCalls++;
        const data = await fetchNpiPage(q.taxonomy, state, skip);
        const results = data.results ?? [];

        if (results.length === 0) {
          hasMore = false;
          break;
        }

        for (const record of results) {
          if (seen.has(record.number)) continue;
          const provider = recordToProvider(record, q);
          if (!provider || provider.state !== state) continue;
          seen.set(record.number, provider);
          stateCount++;
          if (stateCount >= perState) break;
        }

        skip += results.length;
        if (results.length < 200) hasMore = false;

        await new Promise((r) => setTimeout(r, 300));
      }

      console.log(`  ${state} / ${q.taxonomy}: ${stateCount} in state (${seen.size} total)`);
    }
  }

  const providers = [...seen.values()];

  // Mark ~12% as featured for homepage variety
  providers
    .sort((a, b) => a.state.localeCompare(b.state) || a.city.localeCompare(b.city))
    .forEach((p, i) => {
      p.featured = i % 8 === 0;
    });

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(providers, null, 2));

  console.log(`\nDone: ${providers.length} real providers from NPI Registry`);
  console.log(`API calls: ${apiCalls}`);
  console.log(`Written: ${OUT_PATH}`);

  const byState = Object.fromEntries(
    STATES.map((s) => [s, providers.filter((p) => p.state === s).length]),
  );
  console.log("By state:", byState);
}

scrapeAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
