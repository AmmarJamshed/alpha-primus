import {
  events,
  getProviderBySlug,
  getRetreatBySlug,
  getEventBySlug,
  providers,
  retreats,
} from "@/lib/data";
import type { ActivityEventRow, WellnessCheckinRow } from "@/lib/activity/types";

export interface ActivityInsights {
  totalEvents: number;
  categoryCounts: Record<string, number>;
  stateCounts: Record<string, number>;
  recentSearches: string[];
  viewedProviders: string[];
  viewedRetreats: string[];
  viewedEvents: string[];
  positiveSignals: string[];
  concernSignals: string[];
}

export function analyzeActivity(
  rows: ActivityEventRow[],
  checkin: WellnessCheckinRow | null,
): ActivityInsights {
  const categoryCounts: Record<string, number> = {};
  const stateCounts: Record<string, number> = {};
  const recentSearches: string[] = [];
  const viewedProviders: string[] = [];
  const viewedRetreats: string[] = [];
  const viewedEvents: string[] = [];
  const positiveSignals: string[] = [];
  const concernSignals: string[] = [];

  for (const row of rows) {
    if (row.event_type === "search") {
      const q = String(row.metadata?.query ?? "");
      if (q) recentSearches.push(q);
    }

    if (row.event_type === "provider_view" && row.entity_slug) {
      viewedProviders.push(row.entity_slug);
      const p = getProviderBySlug(row.entity_slug);
      if (p) {
        categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1;
        stateCounts[p.state] = (stateCounts[p.state] ?? 0) + 1;
      }
    }

    if (row.event_type === "retreat_view" && row.entity_slug) {
      viewedRetreats.push(row.entity_slug);
      const r = getRetreatBySlug(row.entity_slug);
      if (r) {
        categoryCounts[r.category] = (categoryCounts[r.category] ?? 0) + 1;
        stateCounts[r.state] = (stateCounts[r.state] ?? 0) + 1;
      }
    }

    if (row.event_type === "event_view" && row.entity_slug) {
      viewedEvents.push(row.entity_slug);
      const e = getEventBySlug(row.entity_slug);
      if (e) {
        categoryCounts[e.category] = (categoryCounts[e.category] ?? 0) + 1;
        stateCounts[e.state] = (stateCounts[e.state] ?? 0) + 1;
      }
    }

    if (row.event_type === "category_click") {
      const cat = String(row.metadata?.category ?? row.entity_type ?? "");
      if (cat) categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
    }

    if (row.event_type === "guide_open") {
      positiveSignals.push("Opened the AI wellness guide");
    }
  }

  if (viewedRetreats.length > 0) {
    positiveSignals.push("Exploring retreats and restorative experiences");
  }
  if (viewedEvents.length > 0) {
    positiveSignals.push("Looking into community events and workshops");
  }
  if (recentSearches.length >= 3) {
    positiveSignals.push("Actively searching for support options");
  }

  if (checkin) {
    if (checkin.mood_score <= 2) {
      concernSignals.push(`Low mood reported (${checkin.mood_score}/5)`);
    }
    if (checkin.stress_level >= 4) {
      concernSignals.push(`High stress reported (${checkin.stress_level}/5)`);
    }
    for (const c of checkin.challenges ?? []) {
      concernSignals.push(`Challenge noted: ${c}`);
    }
  }

  if (rows.length === 0 && !checkin) {
    concernSignals.push("Limited activity history — encourage a wellness check-in");
  }

  return {
    totalEvents: rows.length,
    categoryCounts,
    stateCounts,
    recentSearches: recentSearches.slice(0, 8),
    viewedProviders: [...new Set(viewedProviders)].slice(0, 8),
    viewedRetreats: [...new Set(viewedRetreats)].slice(0, 6),
    viewedEvents: [...new Set(viewedEvents)].slice(0, 6),
    positiveSignals,
    concernSignals,
  };
}

export function buildCatalogContext(insights: ActivityInsights) {
  const topState =
    Object.entries(insights.stateCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "CA";

  const topCategories = Object.entries(insights.categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([c]) => c);

  const stateProviders = providers
    .filter((p) => p.state === topState)
    .slice(0, 12)
    .map((p) => ({
      type: "provider" as const,
      slug: p.slug,
      title: p.name,
      category: p.category,
      city: p.city,
      state: p.state,
    }));

  const categoryProviders =
    topCategories.length > 0
      ? providers
          .filter((p) => topCategories.includes(p.category))
          .slice(0, 10)
          .map((p) => ({
            type: "provider" as const,
            slug: p.slug,
            title: p.name,
            category: p.category,
            city: p.city,
            state: p.state,
          }))
      : [];

  const stateRetreats = retreats
    .filter((r) => r.state === topState)
    .slice(0, 6)
    .map((r) => ({
      type: "retreat" as const,
      slug: r.slug,
      title: r.title,
      category: r.category,
      city: r.city,
      state: r.state,
    }));

  const stateEvents = events
    .filter((e) => e.state === topState)
    .slice(0, 6)
    .map((e) => ({
      type: "event" as const,
      slug: e.slug,
      title: e.title,
      category: e.category,
      city: e.city,
      state: e.state,
    }));

  const merged = [...categoryProviders, ...stateProviders, ...stateRetreats, ...stateEvents];
  const seen = new Set<string>();
  const catalog = merged.filter((item) => {
    const key = `${item.type}:${item.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { topState, topCategories, catalog: catalog.slice(0, 24) };
}
