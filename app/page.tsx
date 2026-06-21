import { FeaturedEvents } from "@/components/home/featured-events";
import { FeaturedProviders } from "@/components/home/featured-providers";
import { FeaturedRetreats } from "@/components/home/featured-retreats";
import { GuidedDiscovery } from "@/components/home/guided-discovery";
import { HeroSection } from "@/components/home/hero-section";
import { PopularCategories } from "@/components/home/popular-categories";
import { ProviderClaimCta } from "@/components/home/provider-claim-cta";
import { TestimonialsCarousel } from "@/components/home/testimonials-carousel";
import {
  getFeaturedCategories,
  getFeaturedEvents,
  getFeaturedProviders,
  getFeaturedRetreats,
  testimonials,
} from "@/lib/data";

export default function HomePage() {
  const featuredProviders = getFeaturedProviders(6);
  const featuredRetreats = getFeaturedRetreats(4);
  const featuredEvents = getFeaturedEvents(4);
  const popularCategories = getFeaturedCategories();

  return (
    <>
      <HeroSection />
      <GuidedDiscovery />
      <FeaturedProviders providers={featuredProviders} />
      <FeaturedRetreats retreats={featuredRetreats} />
      <FeaturedEvents events={featuredEvents} />
      <PopularCategories categories={popularCategories} />
      <TestimonialsCarousel testimonials={testimonials.slice(0, 6)} />
      <ProviderClaimCta />
    </>
  );
}
