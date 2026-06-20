import Link from "next/link";
import type { Category } from "@/lib/types";

export function PopularCategories({ categories }: { categories: Category[] }) {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
            Popular Categories
          </h2>
          <p className="mt-4 text-muted-foreground">
            Browse by the type of support that fits your needs.
          </p>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/search?category=${encodeURIComponent(category.name)}`}
              className="rounded-full border border-border/60 bg-white px-5 py-2.5 text-sm font-medium text-[#0B1F3A] transition-all hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 hover:shadow-sm"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
