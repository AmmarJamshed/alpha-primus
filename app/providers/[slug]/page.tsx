import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  Star,
  Video,
} from "lucide-react";
import { ProviderCard } from "@/components/providers/provider-card";
import { EntityViewTracker } from "@/components/activity/entity-view-tracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  getAllProviderSlugs,
  getProviderBySlug,
  getReviewsForProvider,
  getSimilarProviders,
} from "@/lib/data";
import { createMetadata, providerJsonLd } from "@/lib/seo";

interface ProviderPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllProviderSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProviderPageProps) {
  const { slug } = await params;
  const provider = getProviderBySlug(slug);
  if (!provider) return {};

  return createMetadata({
    title: provider.name,
    description: provider.description,
    path: `/providers/${provider.slug}`,
    image: provider.images[0],
  });
}

export default async function ProviderPage({ params }: ProviderPageProps) {
  const { slug } = await params;
  const provider = getProviderBySlug(slug);
  if (!provider) notFound();

  const providerReviews = getReviewsForProvider(provider.id);
  const similar = getSimilarProviders(provider);

  const jsonLd = providerJsonLd(provider);

  return (
    <>
      <EntityViewTracker
        eventType="provider_view"
        entityType="provider"
        entityId={provider.id}
        entitySlug={provider.slug}
        metadata={{ category: provider.category, state: provider.state }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{provider.category}</Badge>
              {provider.verified && (
                <Badge className="bg-[#A8C5A0]/30 text-[#0B1F3A]">Verified</Badge>
              )}
              {provider.virtual_services && (
                <Badge variant="outline" className="gap-1">
                  <Video className="h-3 w-3" /> Virtual Available
                </Badge>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
              {provider.name}
            </h1>

            <div className="mt-3 flex items-center gap-3 text-sm">
              {provider.rating > 0 ? (
                <>
                  <span className="flex items-center gap-1 font-medium">
                    <Star className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />
                    {provider.rating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({provider.review_count} reviews)
                  </span>
                </>
              ) : (
                <span className="rounded-full bg-[#A8C5A0]/30 px-3 py-0.5 text-xs font-medium text-[#0B1F3A]">
                  NPI Registry Verified
                </span>
              )}
              <span className="text-muted-foreground">·</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {provider.city}, {provider.state}
              </span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {provider.images.map((img, i) => (
                <div
                  key={img}
                  className={`relative overflow-hidden rounded-2xl bg-muted ${
                    i === 0 ? "sm:col-span-2 aspect-[21/9]" : "aspect-[4/3]"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${provider.name} photo ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>

            <section className="mt-10">
              <h2 className="text-xl font-semibold text-[#0B1F3A]">About</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {provider.description}
              </p>
            </section>

            {provider.specialties.length > 0 && (
              <section className="mt-10">
                <h2 className="text-xl font-semibold text-[#0B1F3A]">
                  Specialties
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {provider.specialties.map((s) => (
                    <Link
                      key={s}
                      href={`/search?specialty=${encodeURIComponent(s)}`}
                      className="rounded-full border border-border/60 px-4 py-1.5 text-sm hover:border-[#D4AF37]/50"
                    >
                      {s}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {providerReviews.length > 0 && (
              <section className="mt-10">
                <h2 className="text-xl font-semibold text-[#0B1F3A]">Reviews</h2>
                <div className="mt-6 space-y-6">
                  {providerReviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-2xl border border-border/60 p-6"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{review.user_name}</p>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />
                          {review.rating}
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {review.content}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {similar.length > 0 && (
              <section className="mt-16">
                <h2 className="text-xl font-semibold text-[#0B1F3A]">
                  Related Providers
                </h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  {similar.map((p) => (
                    <ProviderCard key={p.id} provider={p} />
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="h-fit space-y-6 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#0B1F3A]">Contact</h2>
              <div className="mt-4 space-y-3 text-sm">
                {provider.phone && (
                  <a
                    href={`tel:${provider.phone}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-[#0B1F3A]"
                  >
                    <Phone className="h-4 w-4" /> {provider.phone}
                  </a>
                )}
                {provider.email && (
                  <a
                    href={`mailto:${provider.email}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-[#0B1F3A]"
                  >
                    <Mail className="h-4 w-4" /> {provider.email}
                  </a>
                )}
                {provider.website ? (
                  <a
                    href={provider.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-[#0B1F3A]"
                  >
                    <Globe className="h-4 w-4" /> Visit Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
                {"source_url" in provider && provider.source_url ? (
                  <a
                    href={
                      provider.source === "serpapi_google_maps"
                        ? `https://www.google.com/maps/place/?q=place_id:${provider.source_id}`
                        : provider.source_url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-[#0B1F3A]"
                  >
                    <Globe className="h-4 w-4" />{" "}
                    {provider.source === "serpapi_google_maps"
                      ? "View on Google Maps"
                      : provider.source === "cms_npi_registry"
                        ? "Verify on NPI Registry"
                        : "View Source"}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
                <p className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  {provider.address}, {provider.city}, {provider.state}{" "}
                  {provider.zipcode}
                </p>
              </div>

              <Separator className="my-6" />

              {!provider.claimed && (
                <Button asChild className="w-full rounded-full bg-[#D4AF37] text-[#0B1F3A] hover:bg-[#D4AF37]/90">
                  <Link href="/providers/claim">Claim This Profile</Link>
                </Button>
              )}
            </div>

            <div className="rounded-2xl bg-[#B8D4E8]/15 p-6 text-sm text-muted-foreground">
              Alpha Primus is a discovery platform. We do not provide healthcare,
              therapy, or treatment. Always verify credentials directly with
              providers.
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
