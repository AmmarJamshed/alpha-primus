import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type {
  ActivityEventInput,
  ActivityEventRow,
  WellnessCheckinRow,
} from "@/lib/activity/types";

const SESSION_HEADER = "x-ap-session-id";

export function getSessionIdFromRequest(request: Request): string | null {
  return request.headers.get(SESSION_HEADER);
}

export async function getAuthUserId(): Promise<string | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function insertActivityEvent(
  request: Request,
  input: ActivityEventInput,
): Promise<{ ok: boolean; error?: string }> {
  const userId = await getAuthUserId();
  const sessionId = getSessionIdFromRequest(request);
  const service = createServiceClient();

  if (!service) {
    return { ok: false, error: "Activity backend not configured" };
  }

  if (!userId && !sessionId) {
    return { ok: false, error: "Missing session" };
  }

  const { error } = await service.from("user_activity_events").insert({
    user_id: userId,
    session_id: userId ? null : sessionId,
    event_type: input.event_type,
    entity_type: input.entity_type ?? null,
    entity_id: input.entity_id ?? null,
    entity_slug: input.entity_slug ?? null,
    metadata: input.metadata ?? {},
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function insertWellnessCheckin(
  request: Request,
  input: {
    mood_score: number;
    stress_level: number;
    challenges?: string[];
    notes?: string;
  },
): Promise<{ ok: boolean; error?: string }> {
  const userId = await getAuthUserId();
  const sessionId = getSessionIdFromRequest(request);
  const service = createServiceClient();

  if (!service) {
    return { ok: false, error: "Activity backend not configured" };
  }

  if (!userId && !sessionId) {
    return { ok: false, error: "Missing session" };
  }

  const { error } = await service.from("user_wellness_checkins").insert({
    user_id: userId,
    session_id: userId ? null : sessionId,
    mood_score: input.mood_score,
    stress_level: input.stress_level,
    challenges: input.challenges ?? [],
    notes: input.notes ?? null,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function fetchActivityContext(
  request: Request,
  limit = 80,
): Promise<{
  activity: ActivityEventRow[];
  checkin: WellnessCheckinRow | null;
  userId: string | null;
  sessionId: string | null;
}> {
  const userId = await getAuthUserId();
  const sessionId = getSessionIdFromRequest(request);
  const service = createServiceClient();

  if (!service || (!userId && !sessionId)) {
    return { activity: [], checkin: null, userId, sessionId };
  }

  let activityQuery = service
    .from("user_activity_events")
    .select("id, event_type, entity_type, entity_id, entity_slug, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  let checkinQuery = service
    .from("user_wellness_checkins")
    .select("mood_score, stress_level, challenges, notes, created_at")
    .order("created_at", { ascending: false })
    .limit(1);

  if (userId) {
    activityQuery = activityQuery.eq("user_id", userId);
    checkinQuery = checkinQuery.eq("user_id", userId);
  } else {
    activityQuery = activityQuery.eq("session_id", sessionId!);
    checkinQuery = checkinQuery.eq("session_id", sessionId!);
  }

  const [activityRes, checkinRes] = await Promise.all([
    activityQuery,
    checkinQuery,
  ]);

  return {
    activity: (activityRes.data ?? []) as ActivityEventRow[],
    checkin: (checkinRes.data?.[0] as WellnessCheckinRow | undefined) ?? null,
    userId,
    sessionId,
  };
}

export async function saveAiRecommendation(
  request: Request,
  payload: {
    support_level: string;
    progress_summary: string;
    encouragement: string;
    wellness_tip: string;
    recommendations: unknown[];
    model: string;
  },
): Promise<void> {
  const userId = await getAuthUserId();
  const sessionId = getSessionIdFromRequest(request);
  const service = createServiceClient();
  if (!service || (!userId && !sessionId)) return;

  await service.from("user_ai_recommendations").insert({
    user_id: userId,
    session_id: userId ? null : sessionId,
    support_level: payload.support_level,
    progress_summary: payload.progress_summary,
    encouragement: payload.encouragement,
    wellness_tip: payload.wellness_tip,
    recommendations: payload.recommendations,
    model: payload.model,
  });
}
