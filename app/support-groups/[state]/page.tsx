import { ProviderCard } from "@/components/providers/provider-card";
import { getProvidersByCategoryAndState } from "@/lib/data";
import { STATE_NAMES } from "@/lib/constants";
import { createMetadata } from "@/lib/seo";

const stateMap: Record<string, string> = {
  california: "CA",
  texas: "TX",
  florida: "FL",
  "new-york": "NY",
  illinois: "IL",
};

interface SeoPageProps {
  params: Promise<{ state: string }>;
}

export async function generateStaticParams() {
  return Object.keys(stateMap).map((state) => ({ state }));
}

export async function generateMetadata({ params }: SeoPageProps) {
  const { state } = await params;
  const code = stateMap[state];
  const name = STATE_NAMES[code] ?? state;

  return createMetadata({
    title: `Support Groups in ${name}`,
    description: `Find support groups and community circles in ${name}. You are not alone.`,
    path: `/support-groups/${state}`,
  });
}

export default async function SupportGroupsStatePage({ params }: SeoPageProps) {
  const { state } = await params;
  const code = stateMap[state];
  const name = STATE_NAMES[code] ?? state;
  const results = getProvidersByCategoryAndState("support-groups", code);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-[#0B1F3A] sm:text-4xl">
        Support Groups in {name}
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Find community, connection, and shared understanding through support
        groups across {name}.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>
    </div>
  );
}
