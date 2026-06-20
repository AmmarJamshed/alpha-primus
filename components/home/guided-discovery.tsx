import Link from "next/link";
import {
  Compass,
  Heart,
  HeartHandshake,
  Leaf,
  MessageCircle,
  Mountain,
  Sprout,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DISCOVERY_CARDS } from "@/lib/constants";

const iconMap = {
  "heart-handshake": HeartHandshake,
  leaf: Leaf,
  sprout: Sprout,
  compass: Compass,
  users: Users,
  heart: Heart,
  "message-circle": MessageCircle,
  mountain: Mountain,
} as const;

export function GuidedDiscovery() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
            What are you looking for today?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose a path that resonates with where you are right now. Every
            step forward matters.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DISCOVERY_CARDS.map((card) => {
            const Icon =
              iconMap[card.icon as keyof typeof iconMap] ?? HeartHandshake;
            return (
              <Link key={card.title} href={card.href} className="group">
                <Card className="h-full border-border/60 transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/40 hover:shadow-md">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1F3A]/5 text-[#0B1F3A] transition-colors group-hover:bg-[#D4AF37]/15 group-hover:text-[#D4AF37]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0B1F3A]">
                      {card.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
