import { STATES, STATE_NAMES, formatZip, sleep, titleCase } from "./utils.mjs";

export function getApiKey() {
  const key = process.env.SERPAPI_KEY;
  if (!key) {
    throw new Error("SERPAPI_KEY environment variable is required for SerpAPI sync.");
  }
  return key;
}

export function parseAddress(address, stateHint) {
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

export function normalizeWebsite(raw) {
  if (!raw) return "";
  let website = raw;
  if (!website.startsWith("http")) website = `https://${website}`;
  try {
    new URL(website);
    return website;
  } catch {
    return "";
  }
}

export function resultImages(result, seed) {
  const thumb = result.thumbnail ?? result.serpapi_thumbnail;
  if (thumb) {
    return [thumb, `https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop`];
  }
  return [
    `https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop&q=80&seed=${seed}`,
    `https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&q=80&seed=${seed}-2`,
  ];
}

/** Single Google Maps search: "{query} in {State Name}" */
export async function searchMapsCategory(query, stateCode) {
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

export async function searchAllStates(queries, onResult) {
  let apiCalls = 0;

  for (const state of STATES) {
    for (const search of queries) {
      try {
        apiCalls++;
        const results = await searchMapsCategory(search.q, state);
        for (const result of results) {
          await onResult(result, search, state);
        }
        console.log(`  SerpAPI ${state} / ${search.label ?? search.q}: ${results.length} results`);
      } catch (err) {
        console.warn(`  SerpAPI warning ${state}/${search.q}: ${err.message}`);
      }
      await sleep(400);
    }
  }

  return apiCalls;
}

export { STATES, STATE_NAMES };
