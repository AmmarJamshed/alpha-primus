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
    title: `Coaches in ${name}`,
    description: `Find life coaches, executive coaches, and career coaches in ${name}.`,
    path: `/coaches/${state}`,
  });
}

export default async function CoachesStatePage({ params }: SeoPageProps) {
  const { state } = await params;
  const code = stateMap[state];
  const name = STATE_NAMES[code] ?? state;
  const lifeCoaches = getProvidersByCategoryAndState("life-coaches", code);
  const execCoaches = getProvidersByCategoryAndState("executive-coaches", code);
  const results = [...lifeCoaches, ...execCoaches];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-[#0B1F3A] sm:text-4xl">
        Coaches in {name}
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Connect with professional coaches who can help you grow, lead, and
        thrive in {name}.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>
    </div>
  );
}
