import { RetreatCard } from "@/components/retreats/retreat-card";
import { retreats } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Wellness Retreats",
  description:
    "Discover transformative wellness, leadership, and growth retreats across the United States.",
  path: "/retreats",
});

export default function RetreatsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
          Retreats & Experiences
        </h1>
        <p className="mt-3 text-muted-foreground">
          Step away from daily life and invest in your wellbeing through curated
          retreat experiences.
        </p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {retreats.map((retreat) => (
          <RetreatCard key={retreat.id} retreat={retreat} />
        ))}
      </div>
    </div>
  );
}
