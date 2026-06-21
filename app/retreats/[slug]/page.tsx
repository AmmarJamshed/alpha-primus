import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ExternalLink, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntityViewTracker } from "@/components/activity/entity-view-tracker";
import { getAllRetreatSlugs, getRetreatBySlug } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

interface RetreatPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllRetreatSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: RetreatPageProps) {
  const { slug } = await params;
  const retreat = getRetreatBySlug(slug);
  if (!retreat) return {};

  return createMetadata({
    title: retreat.title,
    description: retreat.description,
    path: `/retreats/${retreat.slug}`,
    image: retreat.images[0],
  });
}

export default async function RetreatPage({ params }: RetreatPageProps) {
  const { slug } = await params;
  const retreat = getRetreatBySlug(slug);
  if (!retreat) notFound();

  const mapsUrl = retreat.source_url || retreat.booking_link;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <EntityViewTracker
        eventType="retreat_view"
        entityType="retreat"
        entityId={retreat.id}
        entitySlug={retreat.slug}
        metadata={{ category: retreat.category, state: retreat.state }}
      />
      <div className="relative aspect-[21/9] overflow-hidden rounded-3xl bg-muted">
        <Image
          src={retreat.images[0]}
          alt={retreat.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      <p className="mt-6 text-sm font-medium uppercase tracking-wide text-[#D4AF37]">
        {retreat.category}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-[#0B1F3A] sm:text-4xl">
        {retreat.title}
      </h1>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {retreat.date} · {retreat.duration}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4" />
          {retreat.location}
        </span>
        {retreat.price && <span>{retreat.price}</span>}
      </div>

      <p className="mt-8 leading-relaxed text-muted-foreground">
        {retreat.description}
      </p>

      <p className="mt-4 text-sm text-muted-foreground">
        Organized by {retreat.organizer}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {mapsUrl && (
          <Button asChild className="rounded-full bg-[#0B1F3A]">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              View on Google Maps <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}
        {retreat.website && (
          <Button asChild variant="outline" className="rounded-full">
            <a href={retreat.website} target="_blank" rel="noopener noreferrer">
              Visit Website <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}
        {retreat.phone && (
          <Button asChild variant="outline" className="rounded-full">
            <a href={`tel:${retreat.phone.replace(/[^\d+]/g, "")}`}>
              <Phone className="mr-2 h-4 w-4" />
              Call {retreat.phone}
            </a>
          </Button>
        )}
        <Button asChild variant="ghost" className="rounded-full">
          <Link href="/retreats">Back to Retreats</Link>
        </Button>
      </div>
    </div>
  );
}
