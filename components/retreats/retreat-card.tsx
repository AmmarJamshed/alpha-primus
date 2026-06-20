import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Retreat } from "@/lib/types";

export function RetreatCard({ retreat }: { retreat: Retreat }) {
  return (
    <Link href={`/retreats/${retreat.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden border-border/60 transition-all hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <Image
            src={retreat.images[0]}
            alt={retreat.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {retreat.featured && (
            <Badge className="absolute left-3 top-3 bg-[#D4AF37] text-[#0B1F3A]">
              Featured
            </Badge>
          )}
        </div>
        <CardContent className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[#D4AF37]">
            {retreat.category}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-[#0B1F3A] group-hover:underline">
            {retreat.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {retreat.description}
          </p>
          <div className="mt-4 space-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {retreat.date} · {retreat.duration}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {retreat.location}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
