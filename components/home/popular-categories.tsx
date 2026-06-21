"use client";

import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/ui/reveal";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PopularCategories({ categories }: { categories: Category[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
            Popular Categories
          </h2>
          <p className="mt-4 text-muted-foreground">
            Browse by the type of support that fits your needs.
          </p>
        </Reveal>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {categories.map((category, i) => (
            <Reveal key={category.id} delay={i * 40}>
              <Link
                href={`/search?category=${encodeURIComponent(category.name)}`}
                onMouseEnter={() => setActiveId(category.id)}
                onMouseLeave={() => setActiveId(null)}
                onFocus={() => setActiveId(category.id)}
                onBlur={() => setActiveId(null)}
                className={cn(
                  "inline-block rounded-full border border-border/60 bg-white px-5 py-2.5 text-sm font-medium text-[#0B1F3A] transition-all duration-200",
                  "hover:-translate-y-0.5 hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/10 hover:shadow-md",
                  "active:scale-95",
                  activeId === category.id && "border-[#D4AF37]/60 bg-[#D4AF37]/10 shadow-md",
                )}
              >
                {category.name}
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
