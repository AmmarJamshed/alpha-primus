#!/usr/bin/env npx tsx
import providers from "../../data/providers.json";
import retreats from "../../data/retreats.json";
import events from "../../data/events.json";
import { writeFileSync } from "fs";

const report = {
  generated_at: new Date().toISOString(),
  summary: {
    providers: providers.length,
    retreats: retreats.length,
    events: events.length,
    verified_providers: providers.filter((p) => p.verified).length,
    featured_providers: providers.filter((p) => p.featured).length,
    states: [...new Set(providers.map((p) => p.state))],
  },
};

writeFileSync(
  "scripts/discovery/output/report.json",
  JSON.stringify(report, null, 2),
);
console.log("Report generated:", report.summary);
