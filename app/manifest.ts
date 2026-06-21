import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0B1F3A",
    theme_color: "#0B1F3A",
    categories: ["health", "lifestyle", "medical"],
    lang: "en-US",
    dir: "ltr",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [],
    shortcuts: [
      {
        name: "Find Support",
        short_name: "Search",
        url: "/search",
        description: "Search therapists, coaches, and wellness providers",
      },
      {
        name: "Retreats",
        short_name: "Retreats",
        url: "/retreats",
        description: "Browse wellness retreats",
      },
      {
        name: "Events",
        short_name: "Events",
        url: "/events",
        description: "Browse workshops and community events",
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}
