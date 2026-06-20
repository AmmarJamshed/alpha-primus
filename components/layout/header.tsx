"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/search", label: "Find Support" },
  { href: "/retreats", label: "Retreats" },
  { href: "/events", label: "Events" },
  { href: "/providers/claim", label: "For Providers" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex flex-col">
          <span className="text-lg font-semibold tracking-tight text-[#0B1F3A]">
            {SITE_NAME}
          </span>
          <span className="hidden text-xs text-muted-foreground sm:block">
            {SITE_TAGLINE}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-[#0B1F3A]/5",
                pathname.startsWith(link.href)
                  ? "text-[#0B1F3A]"
                  : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="md:hidden">
            <Link href="/search" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="hidden rounded-full border-[#0B1F3A]/20 sm:inline-flex"
          >
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button
            asChild
            className="hidden rounded-full bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 sm:inline-flex"
          >
            <Link href="/search">Find Support</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-border/60 bg-white px-4 py-4 md:hidden"
          aria-label="Mobile"
        >
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Sign In
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
