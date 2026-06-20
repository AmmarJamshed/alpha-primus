import type { MetadataRoute } from "next";
import {
  getAllEventSlugs,
  getAllProviderSlugs,
  getAllRetreatSlugs,
} from "@/lib/data";

const BASE_URL = "https://alphaprimus.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/search",
    "/retreats",
    "/events",
    "/providers/claim",
    "/dashboard",
    "/provider-dashboard",
    "/auth/login",
    "/auth/signup",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const seoStates = ["california", "texas", "florida", "new-york", "illinois"];

  const seoPages = [
    ...seoStates.map((s) => `/therapists/${s}`),
    ...seoStates.map((s) => `/coaches/${s}`),
    ...seoStates.map((s) => `/support-groups/${s}`),
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const providerPages = getAllProviderSlugs().map((slug) => ({
    url: `${BASE_URL}/providers/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const retreatPages = getAllRetreatSlugs().map((slug) => ({
    url: `${BASE_URL}/retreats/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const eventPages = getAllEventSlugs().map((slug) => ({
    url: `${BASE_URL}/events/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...seoPages,
    ...providerPages,
    ...retreatPages,
    ...eventPages,
  ];
}
