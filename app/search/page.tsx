import { ProviderCard } from "@/components/providers/provider-card";
import { SearchFilters } from "@/components/search/search-filters";
import { categories, providers, searchProviders } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Find Support",
  description:
    "Search therapists, coaches, support groups, and wellness providers across the United States.",
  path: "/search",
});

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = getParam(params, "q") ?? getParam(params, "query");
  const category = getParam(params, "category");
  const state = getParam(params, "state");
  const city = getParam(params, "city");
  const specialty = getParam(params, "specialty");
  const virtual = getParam(params, "virtual") === "true";
  const inPerson = getParam(params, "inPerson") === "true";
  const verified = getParam(params, "verified") === "true";
  const featured = getParam(params, "featured") === "true";
  const minRating = getParam(params, "minRating")
    ? Number(getParam(params, "minRating"))
    : undefined;

  const results = searchProviders({
    query,
    category,
    state,
    city,
    specialty,
    virtual,
    inPerson,
    verified,
    featured,
    minRating,
  });

  const alternatives =
    results.length === 0
      ? searchProviders({
          category,
          state,
        }).slice(0, 6)
      : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
          Find Support
        </h1>
        <p className="mt-3 text-muted-foreground">
          Search trusted providers across therapists, coaches, support groups,
          and wellness programs.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
        <SearchFilters
          categories={categories}
          current={{
            query,
            category,
            state,
            city,
            specialty,
            virtual,
            inPerson,
            verified,
            featured,
            minRating,
          }}
        />

        <div>
          {results.length > 0 ? (
            <>
              <p className="mb-6 text-sm text-muted-foreground">
                {results.length} provider{results.length !== 1 ? "s" : ""} found
                {query ? ` for "${query}"` : ""}
              </p>
              <div className="grid gap-6 sm:grid-cols-2">
                {results.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-border/60 bg-[#B8D4E8]/10 p-8">
              <h2 className="text-xl font-semibold text-[#0B1F3A]">
                We couldn&apos;t find an exact match, but here are similar
                providers who may be able to help.
              </h2>
              <p className="mt-2 text-muted-foreground">
                Help is still available. Try adjusting your filters or explore
                these nearby options.
              </p>
              {alternatives.length > 0 && (
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  {alternatives.map((provider) => (
                    <ProviderCard key={provider.id} provider={provider} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
