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

/** When a category has no exact listings, search these related categories (in order). */
export const CATEGORY_RELATED: Record<string, string[]> = {
  "Personal Development Programs": [
    "Life Coaches",
    "Executive Coaches",
    "Career Coaches",
    "Leadership Programs",
    "Mindfulness Programs",
  ],
  "Burnout Recovery Programs": [
    "Therapists",
    "Support Groups",
    "Wellness Centers",
    "Mindfulness Programs",
  ],
  "Relationship Coaches": ["Therapists", "Life Coaches", "Support Groups"],
  "Support Groups": ["Discussion Circles", "Therapists", "Wellness Centers"],
  "Discussion Circles": ["Support Groups", "Community Events", "Men's Groups", "Women's Groups"],
  "Men's Groups": ["Support Groups", "Discussion Circles", "Therapists"],
  "Women's Groups": ["Support Groups", "Discussion Circles", "Therapists"],
  "Leadership Programs": ["Executive Coaches", "Life Coaches", "Leadership Retreats"],
  "Mindfulness Programs": ["Wellness Centers", "Therapists", "Wellness Retreats"],
  "Wellness Centers": ["Mindfulness Programs", "Therapists", "Wellness Retreats"],
  "Mental Health Clinics": ["Therapists", "Wellness Centers"],
  "Wellness Retreats": ["Growth Retreats", "Leadership Retreats", "Wellness Centers"],
  "Leadership Retreats": ["Executive Coaches", "Wellness Retreats", "Leadership Programs"],
  "Growth Retreats": ["Wellness Retreats", "Life Coaches", "Personal Development Programs"],
  "Community Events": ["Support Groups", "Discussion Circles", "Wellness Centers"],
  "Career Coaches": ["Life Coaches", "Executive Coaches"],
};
