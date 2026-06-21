"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLACEHOLDERS = [
  "Therapist in California…",
  "Life coach near Austin…",
  "Burnout recovery program…",
  "Wellness retreat in New York…",
  "Support group in Chicago…",
];

const QUICK_SEARCHES = [
  { label: "Therapists", href: "/search?category=Therapists" },
  { label: "Life Coaches", href: "/search?category=Life+Coaches" },
  { label: "Retreats", href: "/retreats" },
  { label: "Support Groups", href: "/search?category=Support+Groups" },
  { label: "California", href: "/search?state=CA" },
  { label: "New York", href: "/search?state=NY" },
];

export function HeroSearchForm() {
  const router = useRouter();
  const [focused, setFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const id = window.setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/search");
    }
  }

  return (
    <div className="mx-auto mt-12 max-w-2xl">
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex items-center gap-2 rounded-full bg-white p-2 shadow-xl transition-all duration-300",
          focused && "ring-2 ring-[#D4AF37]/60 shadow-2xl scale-[1.02]",
        )}
      >
        <Search
          className={cn(
            "ml-4 h-5 w-5 shrink-0 transition-colors",
            focused ? "text-[#D4AF37]" : "text-muted-foreground",
          )}
        />
        <input
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={PLACEHOLDERS[placeholderIndex]}
          className="flex-1 bg-transparent px-2 py-3 text-sm text-[#0B1F3A] outline-none placeholder:text-muted-foreground"
          aria-label="Search providers, retreats, and events"
        />
        <Button
          type="submit"
          className="rounded-full bg-[#0B1F3A] px-6 transition-transform hover:scale-105 hover:bg-[#0B1F3A]/90 active:scale-95"
        >
          Search
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs text-white/50">Try:</span>
        {QUICK_SEARCHES.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur transition-all hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/20 hover:text-white active:scale-95"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
