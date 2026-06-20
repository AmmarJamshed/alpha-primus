export const SITE_NAME = "Alpha Primus";
export const SITE_TAGLINE = "Become Your Own Leader";
export const SITE_DESCRIPTION =
  "Discover trusted therapists, coaches, retreats, support groups, and growth experiences designed to help you move forward.";

export const LAUNCH_STATES = ["CA", "TX", "FL", "NY", "IL"] as const;

export const STATE_NAMES: Record<string, string> = {
  CA: "California",
  TX: "Texas",
  FL: "Florida",
  NY: "New York",
  IL: "Illinois",
};

export const BRAND = {
  primary: "#0B1F3A",
  accent: "#D4AF37",
  background: "#FFFFFF",
  sage: "#A8C5A0",
  sky: "#B8D4E8",
} as const;

export const DISCOVERY_CARDS = [
  {
    title: "Professional Therapy",
    description: "Licensed therapists for anxiety, depression, trauma, and more.",
    href: "/search?category=Therapists",
    icon: "heart-handshake",
  },
  {
    title: "Stress & Burnout Support",
    description: "Programs and providers focused on recovery and balance.",
    href: "/search?category=Burnout+Recovery+Programs",
    icon: "leaf",
  },
  {
    title: "Personal Growth",
    description: "Coaches and programs to help you grow into your best self.",
    href: "/search?category=Personal+Development+Programs",
    icon: "sprout",
  },
  {
    title: "Leadership Development",
    description: "Executive and leadership coaching for career advancement.",
    href: "/search?category=Executive+Coaches",
    icon: "compass",
  },
  {
    title: "Relationship Support",
    description: "Relationship coaches and couples counseling resources.",
    href: "/search?category=Relationship+Coaches",
    icon: "users",
  },
  {
    title: "Community Support",
    description: "Support groups and community circles near you.",
    href: "/search?category=Support+Groups",
    icon: "heart",
  },
  {
    title: "Discussion Groups",
    description: "Safe spaces for meaningful conversation and connection.",
    href: "/search?category=Discussion+Circles",
    icon: "message-circle",
  },
  {
    title: "Retreats & Experiences",
    description: "Transformative retreats and wellness experiences.",
    href: "/retreats",
    icon: "mountain",
  },
] as const;
