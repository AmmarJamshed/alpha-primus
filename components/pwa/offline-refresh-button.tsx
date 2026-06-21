"use client";

import { Button } from "@/components/ui/button";

export function OfflineRefreshButton() {
  return (
    <Button
      className="rounded-full bg-[#0B1F3A]"
      type="button"
      onClick={() => window.location.reload()}
    >
      Try again
    </Button>
  );
}
