import { Suspense } from "react";
import { ViewTracker } from "@/components/activity/view-tracker";

export function ActivityTracker() {
  return (
    <Suspense fallback={null}>
      <ViewTracker />
    </Suspense>
  );
}
