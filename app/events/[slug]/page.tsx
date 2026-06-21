import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, ExternalLink, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntityViewTracker } from "@/components/activity/entity-view-tracker";
import { getAllEventSlugs, getEventBySlug } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllEventSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: EventPageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return {};

  return createMetadata({
    title: event.title,
    description: event.description,
    path: `/events/${event.slug}`,
    image: event.images[0],
  });
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const mapsUrl = event.source_url || event.registration_url;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <EntityViewTracker
        eventType="event_view"
        entityType="event"
        entityId={event.id}
        entitySlug={event.slug}
        metadata={{ category: event.category, state: event.state }}
      />
      <div className="relative aspect-[21/9] overflow-hidden rounded-3xl bg-muted">
        <Image
          src={event.images[0]}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      <p className="mt-6 text-sm font-medium uppercase tracking-wide text-[#D4AF37]">
        {event.category}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-[#0B1F3A] sm:text-4xl">
        {event.title}
      </h1>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {event.date}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {event.time}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4" />
          {event.location}
        </span>
      </div>

      <p className="mt-8 leading-relaxed text-muted-foreground">
        {event.description}
      </p>

      <p className="mt-4 text-sm text-muted-foreground">
        Organized by {event.organizer}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {mapsUrl && (
          <Button asChild className="rounded-full bg-[#0B1F3A]">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              View on Google Maps <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}
        {event.website && (
          <Button asChild variant="outline" className="rounded-full">
            <a href={event.website} target="_blank" rel="noopener noreferrer">
              Visit Website <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}
        {event.phone && (
          <Button asChild variant="outline" className="rounded-full">
            <a href={`tel:${event.phone.replace(/[^\d+]/g, "")}`}>
              <Phone className="mr-2 h-4 w-4" />
              Call {event.phone}
            </a>
          </Button>
        )}
        <Button asChild variant="ghost" className="rounded-full">
          <Link href="/events">Back to Events</Link>
        </Button>
      </div>
    </div>
  );
}
