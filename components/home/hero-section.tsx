import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_TAGLINE } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0B1F3A] via-[#0B1F3A] to-[#1a3a5c] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(168,197,160,0.08),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[#D4AF37]">
            {SITE_TAGLINE}
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Help is available.
            <span className="mt-2 block text-white/90">You are not alone.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-white/75 sm:text-xl">
            Discover trusted therapists, coaches, retreats, support groups, and
            growth experiences designed to help you move forward.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-[#D4AF37] px-8 text-base font-semibold text-[#0B1F3A] hover:bg-[#D4AF37]/90"
            >
              <Link href="/search">
                Find Support
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/30 bg-transparent px-8 text-base text-white hover:bg-white/10"
            >
              <Link href="/search?category=Personal+Development+Programs">
                Explore Growth Resources
              </Link>
            </Button>
          </div>
        </div>

        <form
          action="/search"
          className="mx-auto mt-12 flex max-w-2xl items-center gap-2 rounded-full bg-white p-2 shadow-xl"
        >
          <Search className="ml-4 h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            type="search"
            name="q"
            placeholder="Therapist California, Anxiety Coach Texas..."
            className="flex-1 bg-transparent px-2 py-3 text-sm text-[#0B1F3A] outline-none placeholder:text-muted-foreground"
            aria-label="Search providers"
          />
          <Button
            type="submit"
            className="rounded-full bg-[#0B1F3A] px-6 hover:bg-[#0B1F3A]/90"
          >
            Search
          </Button>
        </form>
      </div>
    </section>
  );
}
