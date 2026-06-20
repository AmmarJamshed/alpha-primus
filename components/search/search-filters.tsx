"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LAUNCH_STATES, STATE_NAMES } from "@/lib/constants";
import type { Category } from "@/lib/types";

interface FilterState {
  query?: string;
  category?: string;
  state?: string;
  city?: string;
  specialty?: string;
  virtual?: boolean;
  inPerson?: boolean;
  verified?: boolean;
  featured?: boolean;
  minRating?: number;
}

interface SearchFiltersProps {
  categories: Category[];
  current: FilterState;
}

export function SearchFilters({ categories, current }: SearchFiltersProps) {
  const router = useRouter();

  function applyFilters(formData: FormData) {
    const params = new URLSearchParams();
    const fields = [
      "q",
      "category",
      "state",
      "city",
      "specialty",
      "minRating",
    ] as const;

    for (const field of fields) {
      const value = formData.get(field)?.toString().trim();
      if (value) params.set(field === "q" ? "q" : field, value);
    }

    if (formData.get("virtual") === "on") params.set("virtual", "true");
    if (formData.get("inPerson") === "on") params.set("inPerson", "true");
    if (formData.get("verified") === "on") params.set("verified", "true");
    if (formData.get("featured") === "on") params.set("featured", "true");

    router.push(`/search?${params.toString()}`);
  }

  return (
    <aside className="h-fit rounded-2xl border border-border/60 bg-white p-6 shadow-sm lg:sticky lg:top-24">
      <h2 className="text-lg font-semibold text-[#0B1F3A]">Filters</h2>
      <form action={applyFilters} className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="q">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="q"
              name="q"
              defaultValue={current.query}
              placeholder="Name, specialty, city..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select name="category" defaultValue={current.category ?? ""}>
            <SelectTrigger id="category">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Select name="state" defaultValue={current.state ?? ""}>
            <SelectTrigger id="state">
              <SelectValue placeholder="All states" />
            </SelectTrigger>
            <SelectContent>
              {LAUNCH_STATES.map((st) => (
                <SelectItem key={st} value={st}>
                  {STATE_NAMES[st]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={current.city} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialty">Specialty</Label>
          <Input
            id="specialty"
            name="specialty"
            defaultValue={current.specialty}
            placeholder="Anxiety, EMDR, Leadership..."
          />
        </div>

        <div className="space-y-3">
          <Label>Options</Label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="virtual"
              defaultChecked={current.virtual}
              className="rounded"
            />
            Virtual services
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="inPerson"
              defaultChecked={current.inPerson}
              className="rounded"
            />
            In-person
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="verified"
              defaultChecked={current.verified}
              className="rounded"
            />
            Verified only
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={current.featured}
              className="rounded"
            />
            Featured
          </label>
        </div>

        <Button type="submit" className="w-full rounded-full bg-[#0B1F3A]">
          Apply Filters
        </Button>
      </form>
    </aside>
  );
}
