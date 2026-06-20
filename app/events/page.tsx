import { EventCard } from "@/components/events/event-card";
import { events } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Community Events",
  description:
    "Workshops, support meetups, and community gatherings for personal growth and wellness.",
  path: "/events",
});

export default function EventsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
          Events & Gatherings
        </h1>
        <p className="mt-3 text-muted-foreground">
          Connect with your community through workshops, support meetups, and
          growth-focused events.
        </p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
