"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackActivity } from "@/lib/activity/client";

interface ViewTrackerProps {
  eventType?: "provider_view" | "retreat_view" | "event_view";
  entityType?: string;
  entityId?: string;
  entitySlug?: string;
  metadata?: Record<string, unknown>;
}

export function ViewTracker({
  eventType,
  entityType,
  entityId,
  entitySlug,
  metadata,
}: ViewTrackerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (eventType && entitySlug) {
      void trackActivity({
        event_type: eventType,
        entity_type: entityType,
        entity_id: entityId,
        entity_slug: entitySlug,
        metadata,
      });
      return;
    }

    const q = searchParams.get("q");
    const category = searchParams.get("category");

    if (pathname === "/search" && (q || category)) {
      void trackActivity({
        event_type: "search",
        entity_type: "search",
        metadata: {
          query: q ?? "",
          category: category ?? "",
          path: pathname,
        },
      });
      return;
    }

    if (pathname === "/guide") {
      void trackActivity({ event_type: "guide_open", entity_type: "page" });
      return;
    }

    if (
      ["/", "/retreats", "/events", "/dashboard"].includes(pathname) ||
      pathname.startsWith("/therapists/") ||
      pathname.startsWith("/coaches/")
    ) {
      void trackActivity({
        event_type: "page_view",
        entity_type: "page",
        metadata: { path: pathname },
      });
    }
  }, [pathname, searchParams, eventType, entityType, entityId, entitySlug, metadata]);

  return null;
}
