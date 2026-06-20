import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { Button } from "@/components/ui/button";
import type { Event } from "@/lib/types";

export function FeaturedEvents({ events }: { events: Event[] }) {
  return (
    <section className="bg-[#A8C5A0]/10 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
              Upcoming Events
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Workshops, support meetups, and community gatherings happening near
              you.
            </p>
          </div>
          <Button asChild variant="ghost" className="text-[#0B1F3A]">
            <Link href="/events">
              View all events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}
