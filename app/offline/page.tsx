import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OfflineRefreshButton } from "@/components/pwa/offline-refresh-button";
import { SITE_NAME } from "@/lib/constants";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Offline",
  description: `You are offline. Reconnect to continue browsing ${SITE_NAME}.`,
  path: "/offline",
});

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <WifiOff className="h-8 w-8 text-[#0B1F3A]" aria-hidden />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-[#0B1F3A]">You&apos;re offline</h1>
      <p className="mt-3 text-muted-foreground">
        Check your connection, then reload to keep exploring {SITE_NAME}.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <OfflineRefreshButton />
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
