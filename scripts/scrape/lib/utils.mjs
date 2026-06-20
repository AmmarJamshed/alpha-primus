export const STATES = ["CA", "TX", "FL", "NY", "IL"];

export const STATE_CENTROIDS = {
  CA: { lat: 36.7783, lng: -119.4179 },
  TX: { lat: 31.9686, lng: -99.9018 },
  FL: { lat: 27.6648, lng: -81.5158 },
  NY: { lat: 43.2994, lng: -74.2179 },
  IL: { lat: 40.6331, lng: -89.3985 },
};

export const CITIES_BY_STATE = {
  CA: [
    { name: "Los Angeles", lat: 34.0522, lon: -118.2437 },
    { name: "San Francisco", lat: 37.7749, lon: -122.4194 },
    { name: "San Diego", lat: 32.7157, lon: -117.1611 },
    { name: "Sacramento", lat: 38.5816, lon: -121.4944 },
  ],
  TX: [
    { name: "Houston", lat: 29.7604, lon: -95.3698 },
    { name: "Dallas", lat: 32.7767, lon: -96.797 },
    { name: "Austin", lat: 30.2672, lon: -97.7431 },
    { name: "San Antonio", lat: 29.4241, lon: -98.4936 },
  ],
  FL: [
    { name: "Miami", lat: 25.7617, lon: -80.1918 },
    { name: "Orlando", lat: 28.5383, lon: -81.3792 },
    { name: "Tampa", lat: 27.9506, lon: -82.4572 },
    { name: "Jacksonville", lat: 30.3322, lon: -81.6557 },
  ],
  NY: [
    { name: "New York", lat: 40.7128, lon: -74.006 },
    { name: "Buffalo", lat: 42.8864, lon: -78.8784 },
    { name: "Rochester", lat: 43.1566, lon: -77.6088 },
    { name: "Albany", lat: 42.6526, lon: -73.7562 },
  ],
  IL: [
    { name: "Chicago", lat: 41.8781, lon: -87.6298 },
    { name: "Springfield", lat: 39.7817, lon: -89.6501 },
    { name: "Naperville", lat: 41.7508, lon: -88.1535 },
    { name: "Peoria", lat: 40.6936, lon: -89.589 },
  ],
};

export const USER_AGENT =
  "AlphaPrimus/1.0 (https://github.com/AmmarJamshed/alpha-primus; provider-sync@alpha-primus.com)";

/** Remove listings not seen in this many days (2 sync cycles at bi-weekly = 28 days). */
export const STALE_DAYS = 28;

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function titleCase(str) {
  return String(str)
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatPhone(raw) {
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

export function formatZip(postal) {
  if (!postal) return "";
  const z = postal.replace(/\D/g, "");
  return z.length >= 5 ? z.slice(0, 5) : postal;
}

export function picsum(seed) {
  return [
    `https://picsum.photos/seed/${seed}-1/800/600`,
    `https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop`,
    `https://picsum.photos/seed/${seed}-2/800/600`,
  ];
}

export function providerKey(source, sourceId) {
  return `${source}:${sourceId}`;
}

export function dedupeKey(name, city, state) {
  return `${name.toLowerCase().trim()}|${city.toLowerCase().trim()}|${state.toUpperCase()}`;
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function nowIso() {
  return new Date().toISOString();
}

export function isStale(lastSeenAt, staleDays = STALE_DAYS) {
  if (!lastSeenAt) return true;
  const cutoff = Date.now() - staleDays * 24 * 60 * 60 * 1000;
  return new Date(lastSeenAt).getTime() < cutoff;
}
