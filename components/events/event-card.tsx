import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Event } from "@/lib/types";

export function EventCard({ event }: { event: Event }) {
  return (
    <Link href={`/events/${event.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden border-border/60 transition-all hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <Image
            src={event.images[0]}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {event.featured && (
            <Badge className="absolute left-3 top-3 bg-[#D4AF37] text-[#0B1F3A]">
              Featured
            </Badge>
          )}
        </div>
        <CardContent className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[#D4AF37]">
            {event.category}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-[#0B1F3A] group-hover:underline">
            {event.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {event.description}
          </p>
          <div className="mt-4 space-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {event.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {event.time}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {event.location}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
