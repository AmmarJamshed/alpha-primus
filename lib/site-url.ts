/** Canonical site URL for metadata, manifest, and PWA scope. */
export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://alpha-primus.vercel.app"
  );
}
