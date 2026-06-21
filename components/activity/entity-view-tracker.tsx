"use client";

import { useEffect } from "react";
import { trackActivity } from "@/lib/activity/client";

interface EntityViewTrackerProps {
  eventType: "provider_view" | "retreat_view" | "event_view";
  entityType: string;
  entityId: string;
  entitySlug: string;
  metadata?: Record<string, unknown>;
}

export function EntityViewTracker({
  eventType,
  entityType,
  entityId,
  entitySlug,
  metadata,
}: EntityViewTrackerProps) {
  useEffect(() => {
    void trackActivity({
      event_type: eventType,
      entity_type: entityType,
      entity_id: entityId,
      entity_slug: entitySlug,
      metadata,
    });
  }, [eventType, entityType, entityId, entitySlug, metadata]);

  return null;
}
