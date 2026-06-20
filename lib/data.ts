import categoriesData from "@/data/categories.json";
import providersData from "@/data/providers.json";
import retreatsData from "@/data/retreats.json";
import eventsData from "@/data/events.json";
import testimonialsData from "@/data/testimonials.json";
import reviewsData from "@/data/reviews.json";
import type {
  Category,
  Event,
  Provider,
  Retreat,
  Review,
  SearchFilters,
  Testimonial,
} from "@/lib/types";

export const categories = categoriesData as Category[];
export const providers = providersData as Provider[];
export const retreats = retreatsData as Retreat[];
export const events = eventsData as Event[];
export const testimonials = testimonialsData as Testimonial[];
export const reviews = reviewsData as Review[];

export function getProviderBySlug(slug: string): Provider | undefined {
  return providers.find((p) => p.slug === slug);
}

export function getRetreatBySlug(slug: string): Retreat | undefined {
  return retreats.find((r) => r.slug === slug);
}

export function getEventBySlug(slug: string): Event | undefined {
  return events.find((e) => e.slug === slug);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getReviewsForProvider(providerId: string): Review[] {
  return reviews.filter((r) => r.provider_id === providerId && r.approved);
}

export function getFeaturedProviders(limit = 6): Provider[] {
  return providers.filter((p) => p.featured).slice(0, limit);
}

export function getFeaturedRetreats(limit = 4): Retreat[] {
  return retreats.filter((r) => r.featured).slice(0, limit);
}

export function getFeaturedEvents(limit = 4): Event[] {
  return events.filter((e) => e.featured).slice(0, limit);
}

export function getFeaturedCategories(): Category[] {
  return categories.filter((c) => c.featured);
}

export function searchProviders(filters: SearchFilters): Provider[] {
  const query = filters.query?.toLowerCase().trim() ?? "";
  let results = [...providers];

  if (query) {
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query) ||
        p.state.toLowerCase().includes(query) ||
        p.specialties.some((s) => s.toLowerCase().includes(query)),
    );
  }

  if (filters.category) {
    results = results.filter(
      (p) => p.category.toLowerCase() === filters.category!.toLowerCase(),
    );
  }

  if (filters.state) {
    results = results.filter(
      (p) => p.state.toLowerCase() === filters.state!.toLowerCase(),
    );
  }

  if (filters.city) {
    results = results.filter(
      (p) => p.city.toLowerCase().includes(filters.city!.toLowerCase()),
    );
  }

  if (filters.virtual) {
    results = results.filter((p) => p.virtual_services);
  }

  if (filters.inPerson) {
    results = results.filter((p) => p.address);
  }

  if (filters.verified) {
    results = results.filter((p) => p.verified);
  }

  if (filters.featured) {
    results = results.filter((p) => p.featured);
  }

  if (filters.minRating) {
    results = results.filter((p) => p.rating >= filters.minRating!);
  }

  if (filters.specialty) {
    results = results.filter((p) =>
      p.specialties.some(
        (s) => s.toLowerCase() === filters.specialty!.toLowerCase(),
      ),
    );
  }

  return results.sort((a, b) => b.rating - a.rating);
}

export function getSimilarProviders(provider: Provider, limit = 4): Provider[] {
  return providers
    .filter(
      (p) =>
        p.id !== provider.id &&
        (p.category === provider.category || p.state === provider.state),
    )
    .slice(0, limit);
}

export function getProvidersByCategoryAndState(
  categorySlug: string,
  state: string,
): Provider[] {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return [];

  return providers.filter(
    (p) =>
      p.category === category.name &&
      p.state.toLowerCase() === state.toLowerCase(),
  );
}

export function getAllProviderSlugs(): string[] {
  return providers.map((p) => p.slug);
}

export function getAllRetreatSlugs(): string[] {
  return retreats.map((r) => r.slug);
}

export function getAllEventSlugs(): string[] {
  return events.map((e) => e.slug);
}
