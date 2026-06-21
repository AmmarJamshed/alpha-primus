"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Testimonial } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (paused || count <= 1) return;
    const id = window.setInterval(() => goTo(index + 1), 6000);
    return () => window.clearInterval(id);
  }, [index, paused, count, goTo]);

  if (count === 0) return null;

  const current = testimonials[index];

  return (
    <section
      className="bg-[#0B1F3A] py-20 text-white sm:py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Testimonials"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Stories of Hope</h2>
          <p className="mt-4 text-white/70">
            Real people finding their path forward through Alpha Primus.
          </p>
        </div>

        <div className="relative mx-auto mt-12 max-w-3xl">
          <Card className="border-white/10 bg-white/5 text-white backdrop-blur transition-all duration-500">
            <CardContent className="p-8 sm:p-10">
              <Quote className="h-8 w-8 text-[#D4AF37]/80" aria-hidden />
              <p className="mt-4 text-lg leading-relaxed text-white/90 sm:text-xl">
                &ldquo;{current.quote}&rdquo;
              </p>
              <div className="mt-8 flex items-center gap-4">
                <Image
                  src={current.avatar}
                  alt={current.name}
                  width={48}
                  height={48}
                  className="rounded-full ring-2 ring-[#D4AF37]/40"
                />
                <div>
                  <p className="font-semibold">{current.name}</p>
                  <p className="text-sm text-white/60">{current.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {count > 1 && (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => goTo(index - 1)}
                className="absolute -left-2 top-1/2 hidden -translate-y-1/2 rounded-full border-white/20 bg-[#0B1F3A] text-white hover:bg-white/10 sm:-left-14 sm:flex"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => goTo(index + 1)}
                className="absolute -right-2 top-1/2 hidden -translate-y-1/2 rounded-full border-white/20 bg-[#0B1F3A] text-white hover:bg-white/10 sm:-right-14 sm:flex"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>

              <div className="mt-6 flex justify-center gap-2">
                {testimonials.map((t, i) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => goTo(i)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      i === index ? "w-8 bg-[#D4AF37]" : "w-2 bg-white/30 hover:bg-white/50",
                    )}
                    aria-label={`Go to testimonial ${i + 1}`}
                    aria-current={i === index ? "true" : undefined}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
