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
    title: `Therapists in ${name}`,
    description: `Find licensed therapists and mental health professionals in ${name}. Browse verified providers on Alpha Primus.`,
    path: `/therapists/${state}`,
  });
}

export default async function TherapistsStatePage({ params }: SeoPageProps) {
  const { state } = await params;
  const code = stateMap[state];
  const name = STATE_NAMES[code] ?? state;
  const results = getProvidersByCategoryAndState("therapists", code);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-[#0B1F3A] sm:text-4xl">
        Therapists in {name}
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Discover compassionate, licensed therapists across {name}. Help is
        available — take the first step toward healing today.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>
    </div>
  );
}
