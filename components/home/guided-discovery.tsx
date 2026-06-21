"use client";

import Link from "next/link";
import {
  ArrowRight,
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
import { Reveal } from "@/components/ui/reveal";
import { DISCOVERY_CARDS } from "@/lib/constants";
import { trackActivity } from "@/lib/activity/client";
import { cn } from "@/lib/utils";

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
    <section id="discover" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
            What are you looking for today?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose a path that resonates with where you are right now. Every
            step forward matters.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DISCOVERY_CARDS.map((card, i) => {
            const Icon =
              iconMap[card.icon as keyof typeof iconMap] ?? HeartHandshake;
            return (
              <Reveal key={card.title} delay={i * 75}>
                <Link
                  href={card.href}
                  className="group block h-full"
                  onClick={() =>
                    void trackActivity({
                      event_type: "category_click",
                      entity_type: "category",
                      metadata: { category: card.title, href: card.href },
                    })
                  }
                >
                  <Card
                    className={cn(
                      "relative h-full overflow-hidden border-border/60 transition-all duration-300",
                      "hover:-translate-y-2 hover:border-[#D4AF37]/50 hover:shadow-xl",
                      "active:scale-[0.98]",
                    )}
                  >
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/0 to-[#D4AF37]/0 transition-all duration-300 group-hover:from-[#D4AF37]/5 group-hover:to-transparent"
                      aria-hidden
                    />
                    <CardContent className="relative flex h-full flex-col p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1F3A]/5 text-[#0B1F3A] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#D4AF37]/15 group-hover:text-[#D4AF37]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#0B1F3A] transition-colors group-hover:text-[#0B1F3A]">
                        {card.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {card.description}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#D4AF37] opacity-0 transition-all duration-300 group-hover:opacity-100">
                        Explore
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
