import dns from "node:dns/promises";
import { normalizeWebsite } from "./serpapi-shared.mjs";

export function googleMapsPlaceUrl(placeId) {
  if (!placeId) return "";
  return `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}`;
}

/** Returns normalized URL only when the hostname resolves (filters NXDOMAIN / dead domains). */
export async function resolveWebsite(raw) {
  const normalized = normalizeWebsite(raw);
  if (!normalized) return "";

  try {
    const hostname = new URL(normalized).hostname;
    if (!hostname.includes(".")) return "";
    await dns.lookup(hostname);
    return normalized;
  } catch {
    return "";
  }
}

export async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}
