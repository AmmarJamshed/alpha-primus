import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProviderCard } from "@/components/providers/provider-card";
import { Button } from "@/components/ui/button";
import type { Provider } from "@/lib/types";

export function FeaturedProviders({ providers }: { providers: Provider[] }) {
  return (
    <section className="bg-[#B8D4E8]/10 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
              Featured Providers
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Trusted professionals ready to support your journey toward healing
              and growth.
            </p>
          </div>
          <Button asChild variant="ghost" className="text-[#0B1F3A]">
            <Link href="/search">
              View all providers
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      </div>
    </section>
  );
}
