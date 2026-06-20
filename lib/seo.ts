import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export function createMetadata({
  title,
  description,
  path = "",
  image,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`;
  const desc = description ?? SITE_DESCRIPTION;
  const url = `https://alphaprimus.com${path}`;
  const ogImage = image ?? "/og-default.png";

  return {
    title: fullTitle,
    description: desc,
    metadataBase: new URL("https://alphaprimus.com"),
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [ogImage],
    },
    alternates: { canonical: url },
  };
}

export function providerJsonLd(provider: {
  name: string;
  description: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  phone: string;
  rating: number;
  review_count: number;
  images: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: provider.name,
    description: provider.description,
    url: `https://alphaprimus.com/providers/${provider.slug}`,
    telephone: provider.phone,
    image: provider.images[0],
    address: {
      "@type": "PostalAddress",
      streetAddress: provider.address,
      addressLocality: provider.city,
      addressRegion: provider.state,
      postalCode: provider.zipcode,
      addressCountry: "US",
    },
    aggregateRating:
      provider.review_count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: provider.rating,
            reviewCount: provider.review_count,
          }
        : undefined,
  };
}
