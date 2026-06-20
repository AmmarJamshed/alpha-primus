import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

const footerLinks = {
  Discover: [
    { href: "/search?category=Therapists", label: "Therapists" },
    { href: "/search?category=Life+Coaches", label: "Coaches" },
    { href: "/search?category=Support+Groups", label: "Support Groups" },
    { href: "/retreats", label: "Retreats" },
    { href: "/events", label: "Events" },
  ],
  States: [
    { href: "/therapists/california", label: "California" },
    { href: "/therapists/texas", label: "Texas" },
    { href: "/therapists/florida", label: "Florida" },
    { href: "/coaches/new-york", label: "New York" },
    { href: "/support-groups/illinois", label: "Illinois" },
  ],
  Platform: [
    { href: "/providers/claim", label: "Claim Your Profile" },
    { href: "/dashboard", label: "My Dashboard" },
    { href: "/provider-dashboard", label: "Provider Dashboard" },
    { href: "/auth/signup", label: "Create Account" },
  ],
};

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-[#0B1F3A] text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <p className="text-xl font-semibold">{SITE_NAME}</p>
            <p className="mt-2 text-sm text-white/70">{SITE_TAGLINE}</p>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Alpha Primus is a discovery platform connecting you with independent
              therapists, coaches, support groups, and growth experiences. We do
              not provide healthcare or treatment.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#D4AF37]">
                {title}
              </h3>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Not a healthcare provider. For emergencies, call 988 or 911.
          </p>
        </div>
      </div>
    </footer>
  );
}
