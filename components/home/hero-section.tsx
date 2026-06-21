import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSearchForm } from "@/components/home/hero-search-form";
import { SITE_TAGLINE } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0B1F3A] via-[#0B1F3A] to-[#1a3a5c] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="animate-hero-float absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div className="animate-hero-float-delayed absolute -right-16 top-1/3 h-96 w-96 rounded-full bg-[#A8C5A0]/10 blur-3xl" />
        <div className="animate-hero-pulse absolute bottom-0 left-1/2 h-64 w-[32rem] -translate-x-1/2 rounded-full bg-[#B8D4E8]/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.12),transparent_50%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="animate-fade-in-up mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[#D4AF37]">
            {SITE_TAGLINE}
          </p>
          <h1 className="animate-fade-in-up animation-delay-100 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Help is available.
            <span className="mt-2 block text-white/90">You are not alone.</span>
          </h1>
          <p className="animate-fade-in-up animation-delay-200 mt-6 text-lg leading-relaxed text-white/75 sm:text-xl">
            Discover trusted therapists, coaches, retreats, support groups, and
            growth experiences designed to help you move forward.
          </p>
          <div className="animate-fade-in-up animation-delay-300 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-[#D4AF37] px-8 text-base font-semibold text-[#0B1F3A] transition-transform hover:scale-105 hover:bg-[#D4AF37]/90 active:scale-95"
            >
              <Link href="/search">
                Find Support
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/30 bg-transparent px-8 text-base text-white transition-all hover:scale-105 hover:border-white/50 hover:bg-white/10 active:scale-95"
            >
              <Link href="/search?category=Personal+Development+Programs">
                Explore Growth Resources
              </Link>
            </Button>
          </div>
        </div>

        <div className="animate-fade-in-up animation-delay-500">
          <HeroSearchForm />
        </div>

        <a
          href="#discover"
          className="animate-bounce-subtle mt-16 flex flex-col items-center gap-1 text-white/50 transition-colors hover:text-white/80"
          aria-label="Scroll to explore categories"
        >
          <span className="text-xs uppercase tracking-widest">Explore</span>
          <ArrowDown className="h-5 w-5" />
        </a>
      </div>
    </section>
  );
}
