import { STATES } from "./utils.mjs";
import { CATEGORY_SEARCHES } from "../sources/serpapi.mjs";
import { RETREAT_SEARCHES } from "../sources/serpapi-retreats.mjs";
import { EVENT_SEARCHES } from "../sources/serpapi-events.mjs";

/** SerpAPI free tier: 180 searches/month, 2 scheduled runs/month → 90 max per run. */
export const SERPAPI_MONTHLY_LIMIT = 180;
export const SERPAPI_RUNS_PER_MONTH = 2;
export const SERPAPI_MAX_CALLS_PER_RUN = SERPAPI_MONTHLY_LIMIT / SERPAPI_RUNS_PER_MONTH;

const STATE_COUNT = STATES.length;

export const SYNC_MODES = {
  providers: {
    label: "Providers (NPI + Google Maps categories)",
    serpapiCalls: CATEGORY_SEARCHES.length * STATE_COUNT,
    skip: { npi: false, search: false, retreats: true, events: true },
  },
  "retreats-events": {
    label: "Retreats & events (Google Maps venues)",
    serpapiCalls: (RETREAT_SEARCHES.length + EVENT_SEARCHES.length) * STATE_COUNT,
    skip: { npi: true, search: true, retreats: false, events: false },
  },
};

export function estimateSerpApiCalls(syncMode) {
  const mode = SYNC_MODES[syncMode];
  if (!mode) {
    throw new Error(
      `Unknown sync mode "${syncMode}". Use: ${Object.keys(SYNC_MODES).join(", ")}`,
    );
  }
  return mode.serpapiCalls;
}

export function assertWithinBudget(syncMode, maxCalls = SERPAPI_MAX_CALLS_PER_RUN) {
  const estimated = estimateSerpApiCalls(syncMode);
  if (estimated > maxCalls) {
    throw new Error(
      `Sync mode "${syncMode}" needs ${estimated} SerpAPI calls but limit is ${maxCalls} per run (${SERPAPI_MONTHLY_LIMIT}/month).`,
    );
  }
  return estimated;
}

export function assertActualWithinBudget(actualCalls, maxCalls = SERPAPI_MAX_CALLS_PER_RUN) {
  if (actualCalls > maxCalls) {
    throw new Error(
      `SerpAPI budget exceeded: used ${actualCalls} calls (limit ${maxCalls} per run, ${SERPAPI_MONTHLY_LIMIT}/month).`,
    );
  }
}
