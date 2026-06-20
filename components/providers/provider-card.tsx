import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Provider } from "@/lib/types";

interface ProviderCardProps {
  provider: Provider;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <Link href={`/providers/${provider.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={provider.images[0]}
            alt={provider.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {provider.featured && (
            <Badge className="absolute left-3 top-3 bg-[#D4AF37] text-[#0B1F3A]">
              Featured
            </Badge>
          )}
        </div>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#D4AF37]">
                {provider.category}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-[#0B1F3A] group-hover:underline">
                {provider.name}
              </h3>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />
              <span className="font-medium">{provider.rating.toFixed(1)}</span>
            </div>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {provider.description}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {provider.city}, {provider.state}
            </span>
            {provider.virtual_services && (
              <span className="inline-flex items-center gap-1">
                <Video className="h-3.5 w-3.5" />
                Virtual
              </span>
            )}
            {provider.verified && (
              <Badge variant="secondary" className="text-xs">
                Verified
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
