import { NextResponse } from "next/server";
import {
  fetchActivityContext,
  saveAiRecommendation,
} from "@/lib/activity/server";
import { analyzeActivity } from "@/lib/activity/insights";
import { generateAiRecommendations } from "@/lib/groq/recommendations";
import type { WellnessCheckinRow } from "@/lib/activity/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseBodyCheckin(body: unknown): WellnessCheckinRow | null {
  if (!body || typeof body !== "object") return null;
  const c = body as Record<string, unknown>;
  const mood = c.mood_score;
  const stress = c.stress_level;
  if (typeof mood !== "number" || typeof stress !== "number") return null;
  return {
    mood_score: mood,
    stress_level: stress,
    challenges: Array.isArray(c.challenges)
      ? c.challenges.filter((x): x is string => typeof x === "string")
      : [],
    notes: typeof c.notes === "string" ? c.notes : null,
    created_at: new Date().toISOString(),
  };
}

export async function POST(request: Request) {
  try {
    let bodyCheckin: WellnessCheckinRow | null = null;
    try {
      const body = await request.json();
      bodyCheckin = parseBodyCheckin(body?.checkin);
    } catch {
      // Empty body is fine
    }

    const { activity, checkin: dbCheckin } = await fetchActivityContext(request);
    const checkin = bodyCheckin ?? dbCheckin;

    const { result, model } = await generateAiRecommendations(activity, checkin);

    await saveAiRecommendation(request, {
      support_level: result.support_level,
      progress_summary: result.progress_summary,
      encouragement: result.encouragement,
      wellness_tip: result.wellness_tip,
      recommendations: result.recommendations,
      model,
    });

    const insights = analyzeActivity(activity, checkin);

    return NextResponse.json({
      ...result,
      model,
      activity_summary: {
        total_events: insights.totalEvents,
        positive_signals: insights.positiveSignals,
        concern_signals: insights.concernSignals,
      },
    });
  } catch (err) {
    console.error("AI recommendations error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to generate recommendations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { activity, checkin } = await fetchActivityContext(request);
    const insights = analyzeActivity(activity, checkin);

    return NextResponse.json({
      activity_count: insights.totalEvents,
      latest_checkin: checkin,
      positive_signals: insights.positiveSignals,
      concern_signals: insights.concernSignals,
      top_categories: insights.categoryCounts,
    });
  } catch (err) {
    console.error("AI recommendations GET error:", err);
    return NextResponse.json({ error: "Failed to load activity" }, { status: 500 });
  }
}
