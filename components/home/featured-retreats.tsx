import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RetreatCard } from "@/components/retreats/retreat-card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import type { Retreat } from "@/lib/types";

export function FeaturedRetreats({ retreats }: { retreats: Retreat[] }) {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
              Featured Retreats
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Step away, reset, and return with clarity through transformative
              wellness experiences.
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            className="text-[#0B1F3A] transition-transform hover:scale-105"
          >
            <Link href="/retreats">
              Explore retreats
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {retreats.map((retreat, i) => (
            <Reveal key={retreat.id} delay={i * 80}>
              <RetreatCard retreat={retreat} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
