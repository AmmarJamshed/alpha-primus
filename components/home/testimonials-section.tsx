import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import type { Testimonial } from "@/lib/types";

export function TestimonialsSection({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  return (
    <section className="bg-[#0B1F3A] py-20 text-white sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Stories of Hope
          </h2>
          <p className="mt-4 text-white/70">
            Real people finding their path forward through Alpha Primus.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <Card
              key={t.id}
              className="border-white/10 bg-white/5 text-white backdrop-blur"
            >
              <CardContent className="p-6">
                <p className="text-sm leading-relaxed text-white/85">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-white/60">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
